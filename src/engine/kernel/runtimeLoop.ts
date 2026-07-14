import { OpportunityEntity } from '@/types/marketplace';
import { processCollapseQueue } from '../demandArbitration/priorityQueue';
import { simulateForecast } from '../forecast/forecastEngine';
import { evaluateSystemPolicy } from '../policy/engine';
import { evaluateCommit } from '../policy/gatekeeper';
import { hashSnapshot } from '../replay/hash';
import { appendToLedger } from '../replay/ledger';
import { BackpressureMetrics, computeExecutionLoadFactor } from './backpressure';
import { createTickIdGenerator } from './deterministicId';
import { SystemSnapshot } from './snapshot';
import { EconomyState, store } from './store';

let metricsLastTick: BackpressureMetrics = {
  lockedEventsLastTick: 0,
  evaluationsLastTick: 0,
};

/**
 * Phase 1: Sense
 * Generates the frozen SystemSnapshot from the store.
 */
function createSnapshot(timestamp: number, state: EconomyState): SystemSnapshot {
  return {
    timestamp,
    demand: {
      signals: [...state.demand.signals],
      clusters: [...state.demand.clusters],
    },
    supply: {
      signals: [...state.supply.signals],
    },
    trustEdges: [...state.trustGraph.edges],
    opportunities: [...state.opportunities],
    cooldowns: {
      cluster: { ...state.cooldowns.cluster },
      supply: { ...state.cooldowns.supply },
    },
    derived: {
      demandPressureMap: {},
      supplyElasticityMap: {},
      matchTensionMap: {},
    },
  };
}

/**
 * Executes a single deterministic tick of the economy.
 * Fully deterministic. No system time APIs allowed inside engine.
 */
export function executeRuntimeTick(currentTimestamp: number) {
  const idGen = createTickIdGenerator(currentTimestamp);

  // --- PHASE 1: SENSE ---
  const rawState = store.getState();
  const snapshot = createSnapshot(currentTimestamp, rawState);
  const currentSnapshotHash = hashSnapshot(snapshot);

  appendToLedger({
    id: idGen.next('evt'),
    type: 'SNAPSHOT_CREATED',
    timestamp: currentTimestamp,
    payload: { snapshot, tickIndex: currentTimestamp },
    snapshotHash: currentSnapshotHash,
    kernelTickId: idGen.next('tick'),
  });

  const loadFactor = computeExecutionLoadFactor(metricsLastTick);

  let currentTickEvaluations = 0;
  let currentTickLocked = 0;

  // --- PHASE 2: FIELD UPDATES ---
  snapshot.demand.clusters.forEach((c) => {
    snapshot.derived.demandPressureMap[c.id] = c.pressure;
  });

  const categories = [
    ...new Set(snapshot.demand.clusters.map((c) => c.category)),
  ];

  categories.forEach((cat) => {
    snapshot.derived.supplyElasticityMap[cat] = 0.5;
  });

  snapshot.demand.clusters.forEach((c) => {
    const p = snapshot.derived.demandPressureMap[c.id];
    const e = snapshot.derived.supplyElasticityMap[c.category] ?? 0;
    snapshot.derived.matchTensionMap[c.id] = p - e;
  });

  // --- PHASE 3: ARBITRATION ---
  const trustDensityMap: Record<string, number> = {};

  snapshot.trustEdges.forEach((edge) => {
    trustDensityMap[edge.fromEntityId] =
      (trustDensityMap[edge.fromEntityId] ?? 0) + edge.weight;

    trustDensityMap[edge.toEntityId] =
      (trustDensityMap[edge.toEntityId] ?? 0) +
      edge.weight * edge.successRate;
  });

  const getElasticity = (category: string): number =>
    snapshot.derived.supplyElasticityMap[category] ?? 0.5;

  const arbitrationResult = processCollapseQueue(
    snapshot.demand.clusters,
    snapshot.supply.signals,
    trustDensityMap,
    getElasticity,
    currentTimestamp,
    idGen
  );

  const postArbitrationClusters = arbitrationResult.updatedClusters;

  // --- PHASE 4 ---
  const lockedOpportunities: OpportunityEntity[] = [
    ...arbitrationResult.newOpportunities,
  ];

  const updatedClusterIds = new Set<string>();

  for (const cluster of postArbitrationClusters) {
    if (currentTickEvaluations * loadFactor > 50) break;
    currentTickEvaluations++;
    updatedClusterIds.add(cluster.id);
  }

  // --- FORECAST ---
  const forecast = simulateForecast(snapshot, 3);

  // --- POLICY ---
  const policyState = evaluateSystemPolicy(
    snapshot,
    forecast,
    metricsLastTick
  );

  // --- PHASE 5: COMMIT ---
  const finalOpportunities = [...snapshot.opportunities];

  for (const opp of lockedOpportunities) {
    const decision = evaluateCommit(
      { type: 'OPPORTUNITY_EMITTED', payload: opp },
      policyState
    );

    if (decision.allowed) {
      finalOpportunities.push(opp);

      appendToLedger({
        id: idGen.next('evt'),
        type: 'OPPORTUNITY_EMITTED',
        timestamp: currentTimestamp,
        payload: { opportunity: opp },
        snapshotHash: currentSnapshotHash,
        kernelTickId: idGen.next('tick'),
      });

      currentTickLocked++;
    } else {
      appendToLedger({
        id: idGen.next('evt'),
        type: 'OPPORTUNITY_EMITTED',
        timestamp: currentTimestamp,
        payload: {
          opportunity: opp,
          policyIntervention: decision,
        },
        snapshotHash: currentSnapshotHash,
        kernelTickId: idGen.next('tick'),
      });
    }
  }

  // --- PHASE 6: COMMIT ---
  store.applyMutations({
    opportunities: finalOpportunities,
  });

  metricsLastTick = {
    evaluationsLastTick: currentTickEvaluations,
    lockedEventsLastTick: currentTickLocked,
  };
}
