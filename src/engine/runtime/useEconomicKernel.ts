import { globalDecisionStore } from '@/engine/explainability/store';
import { simulateForecast } from '@/engine/forecast/forecastEngine';
import { store } from '@/engine/kernel/store';
import { evaluateSystemPolicy } from '@/engine/policy/engine';
import { hashSnapshot } from '@/engine/replay/hash';
import { appendToLedger } from '@/engine/replay/ledger';
import { EconomyRepository } from '@/repositories/interfaces';
import { buildSnapshot } from '@/repositories/snapshotFactory';
import { LocalityQuery } from '@/types/locality';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_ENGINE_VIEW, EngineSnapshotView } from './types';

const TICK_INTERVAL_MS = 3000;

interface UseEconomicKernelOptions {
  repository: EconomyRepository;
  locality?: LocalityQuery;
  autoStart?: boolean;
}

/**
 * Fully deterministic UI bridge.
 * NO system time APIs allowed.
 */
export function useEconomicKernel({
  repository,
  locality,
  autoStart = true,
}: UseEconomicKernelOptions) {
  const [view, setView] = useState<EngineSnapshotView>(EMPTY_ENGINE_VIEW);

  const isRunningRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const metricsRef = useRef({
    lockedEventsLastTick: 0,
    evaluationsLastTick: 0,
  });

  // deterministic tick counter (NOT time-based)
  const tickCounterRef = useRef(0);

  const runTick = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const tickIndex = tickCounterRef.current++;
    const tickId = `tick_${tickIndex}`;

    try {
      // ── Snapshot ──────────────────────
      let snapshot;
      try {
        snapshot = await buildSnapshot(repository, tickIndex);
      } catch (err: any) {
        setView((prev) => ({
          ...prev,
          isLoading: false,
          error: err.message,
        }));
        return;
      }

      const snapshotHash = hashSnapshot(snapshot);

      store.applyMutations({
        demand: snapshot.demand,
        supply: snapshot.supply,
        trustGraph: { edges: snapshot.trustEdges },
        opportunities: snapshot.opportunities,
      });

      // ── Forecast ──────────────────────
      const forecast = simulateForecast(snapshot, 3);

      // ── Policy ────────────────────────
      const policyState = evaluateSystemPolicy(
        snapshot,
        forecast,
        metricsRef.current
      );

      // ── Ledger ────────────────────────
      appendToLedger({
        id: `evt_tick_${tickIndex}_snap`,
        type: 'SNAPSHOT_CREATED',
        timestamp: tickIndex,
        payload: {
          snapshotHash,
          tickId,
          interventionLevel: policyState.interventionLevel,
        },
        snapshotHash,
        kernelTickId: tickId,
      });

      // ── UI ────────────────────────────
      const latestDecisions = globalDecisionStore.slice(-10);

      setView({
        supplySignals: snapshot.supply.signals,
        demandClusters: snapshot.demand.clusters,
        trustEdges: snapshot.trustEdges,
        opportunities: snapshot.opportunities,
        phaseTransitions: forecast.projections.flatMap(
          (t) => t.projectedTransitions
        ),
        forecast: {
          ticks: forecast.projections,
          horizonTicks: forecast.horizonTicks,
        },
        policy: policyState,
        policyLevel: policyState.interventionLevel,
        recentDecisions: latestDecisions,
        lastTickTimestamp: tickIndex,
        tickId,
        snapshotHash,
        isLoading: false,
        error: null,
      });

      metricsRef.current = {
        lockedEventsLastTick: snapshot.opportunities.length,
        evaluationsLastTick: snapshot.demand.clusters.length,
      };
    } finally {
      isRunningRef.current = false;
    }
  }, [repository]);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    runTick();
    intervalRef.current = setInterval(runTick, TICK_INTERVAL_MS);
  }, [runTick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
  }, [autoStart, start, stop]);

  return { view, start, stop };
}
