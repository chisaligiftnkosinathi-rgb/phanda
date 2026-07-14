import { EvidenceBundle } from "@axionyx/contracts";
import { AxionyxSystem } from "../../bootstrap/compositionRoot";
import { CausalTrace } from "@axionyx/audit/dist/model/TraceTypes";
import { ExecutionMode } from "@axionyx/ports";

export class ShadowExecutor {
  static async execute<T, U>(params: {
    capability: string;
    request: any;
    legacyHandler: () => Promise<T>;
    evidenceFactory: (legacyResult: T | undefined) => EvidenceBundle;
    newRuntimeHandler?: (truth: any, ops: any) => U; // The mapping of phanda ops to the expected result type
    comparator?: (legacy: T, newRuntime: U) => "MATCH" | "DIVERGED";
  }): Promise<T | U> {
    const mode = AxionyxSystem.ports.featureFlags.getExecutionMode(params.capability);

    if (mode === ExecutionMode.LEGACY) {
      return params.legacyHandler();
    }

    const requestId = `req_${Date.now()}`;
    const startTimeLegacy = Date.now();
    let legacyResult: T | undefined;
    let legacyTime = 0;

    if (mode === ExecutionMode.SHADOW || mode === ExecutionMode.CANARY) {
      try {
        legacyResult = await params.legacyHandler();
      } catch (e) {
        if (mode === ExecutionMode.SHADOW) throw e;
      }
      legacyTime = Date.now() - startTimeLegacy;
    }

    // Execute the new runtime pipeline
    const executeNewRuntime = async () => {
      const startTimeShadow = Date.now();
      let traceId = "";
      let evidenceId = "";
      let assertionId = undefined;
      let hash1 = "";
      let isDeterministic = false;
      let comparisonResult: "MATCH" | "DIVERGED" = "MATCH";
      let newResult: U | undefined;

      try {
        const evidence = params.evidenceFactory(legacyResult);
        evidenceId = evidence.id;
        traceId = `trace_${evidence.id}`;
        
        const truth = AxionyxSystem.axis.evaluate({} as any, [evidence])[0];
        assertionId = truth.assertionId;
        const ops = AxionyxSystem.phanda.process(truth);
        
        if (params.newRuntimeHandler) {
            newResult = params.newRuntimeHandler(truth, ops);
            if (legacyResult !== undefined && params.comparator) {
                comparisonResult = params.comparator(legacyResult, newResult);
            }
        }

        const action = {
          actionId: `act_${ops[0]?.opportunityId || 'default'}`,
          opportunityId: ops[0]?.opportunityId || 'default',
          actorId: "system",
          decision: ops[0]?.actionRequired || 'VERIFY_SHADOW',
          timestamp: new Date().toISOString()
        };
        
        const valueFlow = AxionyxSystem.phanda.execute(action);

        const trace: CausalTrace = {
          traceId, evidence, truth, opportunities: ops,
          actions: [action], valueFlows: [valueFlow],
          events: [], createdAt: new Date().toISOString()
        };

        AxionyxSystem.audit.record(trace);

        const retrieved = AxionyxSystem.audit.get(trace.traceId)!;
        const replay1 = AxionyxSystem.replay.replay(retrieved, trace.createdAt);
        hash1 = AxionyxSystem.verifier.hash(retrieved);
        const hash2 = AxionyxSystem.verifier.hash(replay1);
        isDeterministic = hash1 === hash2;

      } catch (err) {
        AxionyxSystem.ports.logger.error("ShadowExecutor Pipeline failed", err as Error);
        if (mode === ExecutionMode.ACTIVE || mode === ExecutionMode.CANARY) throw err;
      }

      const shadowTime = Date.now() - startTimeShadow;

      const telemetry = {
        traceId, requestId, capability: params.capability,
        evidenceId, assertionId, shadowDurationMs: shadowTime,
        legacyDurationMs: legacyTime, deterministic: isDeterministic,
        replayHash: hash1, comparisonResult, timestamp: new Date().toISOString(),
        runtimeVersion: "1.0.0-rc1", featureFlag: `shadow-mode-${params.capability.toLowerCase().replace(/\s+/g, '-')}`
      };

      AxionyxSystem.observatory.collector.collect(telemetry);
      AxionyxSystem.ports.logger.info("SHADOW MODE TELEMETRY", telemetry as unknown as Record<string, unknown>);

      return newResult;
    };

    if (mode === ExecutionMode.SHADOW) {
      executeNewRuntime().catch(() => {});
      return legacyResult as T;
    }

    if (mode === ExecutionMode.CANARY) {
      const newResult = await executeNewRuntime();
      return newResult as U;
    }

    if (mode === ExecutionMode.ACTIVE) {
      const newResult = await executeNewRuntime();
      return newResult as U;
    }

    return params.legacyHandler(); // Fallback
  }
}
