import { AxisEpistemicKernel, DomainPlugin } from "@axionyx/core";
import { PhandaEngine, OpportunityMapper, SettlementEngine } from "@phanda/core";
import { EpistemicEventBus } from "@axionyx/runtime/dist/bus/EpistemicEventBus";
import { EvidenceFactory } from "@axionyx/runtime/dist/factory/EvidenceFactory";
import { AuditLedger } from "@axionyx/audit/dist/ledger/AuditLedger";
import { ReplayEngine } from "@axionyx/audit/dist/replay/ReplayEngine";
import { DeterminismVerifier } from "@axionyx/audit/dist/verify/DeterminismVerifier";
import { EvidenceBundle } from "@axionyx/contracts";
import { InMemoryMetricsRepository, MetricsAggregator, TelemetryCollector, MetricsQueryService } from "@axionyx/observatory";
import { ProjectionEngine, ProjectionRegistry } from "@axionyx/runtime";

// Import Phanda Projections
import { WalletSummaryProjection, ReputationProjection, OpportunityFeedProjection } from "../projections";

// Import Adapters
import { PhandaIdentityProvider } from "../adapters/identity/PhandaIdentityProvider";
import { LocalEvidenceRepository } from "../adapters/repository/LocalEvidenceRepository";
import { LocalEventBus } from "../adapters/messaging/LocalEventBus";
import { SystemClock } from "../adapters/time/SystemClock";
import { StructuredLogger } from "../adapters/logging/StructuredLogger";
import { EnvironmentFeatureFlagProvider } from "../adapters/configuration/EnvironmentFeatureFlagProvider";

/**
 * COMPOSITION ROOT
 * The only file in the application allowed to construct core packages and infrastructure.
 */

// 1. Initialize Ports (Infrastructure Adapters)
export const identityProvider = new PhandaIdentityProvider();
export const evidenceRepository = new LocalEvidenceRepository();
export const eventBus = new LocalEventBus();
export const clock = new SystemClock();
export const logger = new StructuredLogger();
export const featureFlags = new EnvironmentFeatureFlagProvider();

// 2. Initialize Core Epistemic Kernel
class PhandaIdentityPlugin implements DomainPlugin {
  domain = 'identity';
  interpret(e: EvidenceBundle) { return { status: "verified" }; }
}
export const axisKernel = new AxisEpistemicKernel(
  [new PhandaIdentityPlugin()],
  { validate: () => {} },
  { verify: () => {} },
  { scan: () => {} }
);

// 3. Initialize Core Behavioral Engine
export const phandaEngine = new PhandaEngine(new OpportunityMapper(), new SettlementEngine());

// 4. Initialize Observability & Audit Layer
export const auditLedger = new AuditLedger();
export const determinismVerifier = new DeterminismVerifier();
export const replayEngine = new ReplayEngine(axisKernel, phandaEngine);

// 5. Initialize the Runtime Orchestrator
export const runtimeEventBus = new EpistemicEventBus();

// 6. Initialize Projections
export const projectionRegistry = new ProjectionRegistry();
projectionRegistry.register(new WalletSummaryProjection());
projectionRegistry.register(new ReputationProjection());
projectionRegistry.register(new OpportunityFeedProjection());

export const projectionEngine = new ProjectionEngine(projectionRegistry);

// Wire AuditLedger append event to ProjectionEngine
auditLedger.onTraceRecorded = (trace) => {
    projectionEngine.processTrace(trace);
};

// 7. Initialize Observatory
export const metricsRepository = new InMemoryMetricsRepository();
export const metricsAggregator = new MetricsAggregator(metricsRepository);
export const telemetryCollector = new TelemetryCollector(metricsAggregator);
export const metricsQueryService = new MetricsQueryService(metricsRepository);

// Expose the integrated system boundary
export const AxionyxSystem = {
  axis: axisKernel,
  phanda: phandaEngine,
  runtime: {
      eventBus: runtimeEventBus,
      projections: projectionEngine
  },
  audit: auditLedger,
  replay: replayEngine,
  verifier: determinismVerifier,
  observatory: {
    collector: telemetryCollector,
    query: metricsQueryService
  },
  ports: {
    identity: identityProvider,
    evidence: evidenceRepository,
    events: eventBus,
    clock: clock,
    logger: logger,
    featureFlags: featureFlags
  }
};
