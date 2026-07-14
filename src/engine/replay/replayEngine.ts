import { LedgerEntry } from './ledger';
import { ReplayState } from './types';
import { SystemSnapshot } from '../kernel/snapshot';

/**
 * Replays the economic ledger to perfectly reconstruct the causal state of the economy.
 * This function is STRICTLY PURE. It does not read live store or kernel data.
 */
export function replayFromLedger(
  ledger: LedgerEntry[], 
  initialSeedState?: SystemSnapshot
): ReplayState {
  
  const state: ReplayState = {
    tickIndex: 0,
    snapshot: initialSeedState || null,
    demand: initialSeedState ? [...initialSeedState.demand.clusters] : [],
    supply: initialSeedState ? [...initialSeedState.supply.signals] : [],
    trustGraph: initialSeedState ? [...initialSeedState.trustEdges] : [],
    events: [],
    derived: {
      activeOpportunities: initialSeedState ? [...initialSeedState.opportunities] : [],
      phaseTransitions: [],
    }
  };

  for (const entry of ledger) {
    state.events.push(entry);
    
    switch (entry.type) {
      case 'SNAPSHOT_CREATED':
        state.snapshot = entry.payload.snapshot;
        state.tickIndex = entry.payload.tickIndex;
        break;

      case 'DEMAND_UPDATED':
        // Overwrite demand cluster state with exactly what was mutated
        const updatedCluster = entry.payload.cluster;
        const cIndex = state.demand.findIndex(c => c.id === updatedCluster.id);
        if (cIndex >= 0) {
          state.demand[cIndex] = updatedCluster;
        } else {
          state.demand.push(updatedCluster);
        }
        break;

      case 'PHASE_TRANSITION':
        state.derived.phaseTransitions.push(entry.payload.event);
        break;

      case 'OPPORTUNITY_EMITTED':
        state.derived.activeOpportunities.push(entry.payload.opportunity);
        break;

      case 'TRUST_EDGE_CREATED':
        state.trustGraph.push(entry.payload.edge);
        break;
        
      // Other events would update their respective local representations
    }
  }

  return state;
}
