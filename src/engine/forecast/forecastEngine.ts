import { DemandCluster } from '@/types/demand';
import { SupplySignal } from '@/types/supply';
import { createTickIdGenerator } from '../kernel/deterministicId';
import { SystemSnapshot } from '../kernel/snapshot';
import { evaluatePhaseTransition } from '../phaseTransition';
import { calculateForecastConfidence } from './confidence';
import { projectDemandTick } from './demandProjection';
import { projectSupplyTick } from './supplyProjection';
import { ForecastState, ForecastTick } from './types';

/**
 * The Shadow Kernel.
 * Simulates the deterministic physics of the economy forward in time without mutating real state.
 */
export function simulateForecast(
  baseSnapshot: SystemSnapshot,
  horizonTicks: number
): ForecastState {

  const projections: ForecastTick[] = [];

  // Clone the initial state to run shadow simulation
  let currentDemand: DemandCluster[] = JSON.parse(JSON.stringify(baseSnapshot.demand.clusters));
  let currentSupply: SupplySignal[] = JSON.parse(JSON.stringify(baseSnapshot.supply.signals));

  for (let tick = 0; tick < horizonTicks; tick++) {
    const projectedTransitions = [];
    const projectedOpportunities = [];

    // 1. Project fields forward (Demand heats up, Supply fatigues)
    currentDemand = currentDemand.map(c => projectDemandTick(c, tick));
    currentSupply = currentSupply.map(s => projectSupplyTick(s, tick));

    // 2. Probabilistic Phase Transitions (Shadow mode)
    // We mock the arbitration and jump straight to potential matches
    const shadowTimestamp = baseSnapshot.timestamp + ((tick + 1) * 2000);
    // Deterministic ID generator reused across all evaluations for this simulated timestamp
    const forecastIdGen = createTickIdGenerator(shadowTimestamp);

    for (const cluster of currentDemand) {
      if (cluster.state === 'collapsed') continue;

      const candidateSupplies = currentSupply.filter(
        s => s.capability.toLowerCase() === cluster.category.toLowerCase()
      );

      for (const supply of candidateSupplies) {
        const phaseResult = evaluatePhaseTransition({
          demandPressure: cluster.pressure,
          supplyElasticity: 0.5, // Mock shadow elasticity
          trustProximity: 0.8,
          skillMatch: 1.0,
          locationFit: 0.9,
          cluster,
          supply,
          now: shadowTimestamp,
          idGen: forecastIdGen,
        });

        if (phaseResult) {
          projectedTransitions.push(phaseResult.event);
          if (phaseResult.event.state === "LOCKED" && phaseResult.lockedOpportunity) {
            cluster.state = "collapsed"; // consume in shadow reality
            projectedOpportunities.push(phaseResult.lockedOpportunity);
            break;
          }
        }
      }
    }

    projections.push({
      tickIndex: tick,
      demand: JSON.parse(JSON.stringify(currentDemand)),
      supply: JSON.parse(JSON.stringify(currentSupply)),
      projectedTransitions,
      projectedOpportunities,
      confidence: calculateForecastConfidence(tick)
    });
  }

  return {
    baseSnapshot,
    horizonTicks,
    projections
  };
}
