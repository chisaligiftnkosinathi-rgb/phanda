import { globalLedger, LedgerEntry } from './ledger';
import { OpportunityEntity } from '@/types/marketplace';

export interface CausalChain {
  opportunityId: string;
  emergedAtTick: string;
  originDemandClusterId?: string;
  originSupplySignalId?: string;
  phaseTransitions: any[];
  relatedEvents: LedgerEntry[];
}

/**
 * Enterprise-grade explainability engine.
 * Reconstructs the exact physical chain of events that birthed an opportunity.
 */
export function explainOpportunity(opportunityId: string): CausalChain | null {
  // 1. Find the emission event
  const emissionEvent = globalLedger.find(
    e => e.type === "OPPORTUNITY_EMITTED" && e.payload.opportunity.identity.id === opportunityId
  );

  if (!emissionEvent) {
    return null;
  }

  const opp: OpportunityEntity = emissionEvent.payload.opportunity;
  const originClusterId = opp.variantData.originDemandSignalId;
  const supplySignalId = emissionEvent.payload.supplySignalId;

  // 2. Trace Phase Transitions for this specific match
  const phaseTransitions = globalLedger.filter(
    e => e.type === "PHASE_TRANSITION" &&
         e.payload.event.clusterId === originClusterId &&
         e.payload.event.supplySignalId === supplySignalId
  ).map(e => e.payload.event);

  // 3. Trace Cluster formation & collapse
  const clusterEvents = globalLedger.filter(
    e => (e.type === "CLUSTER_FORMED" || e.type === "CLUSTER_COLLAPSED" || e.type === "DEMAND_UPDATED") &&
         e.payload.cluster?.id === originClusterId
  );

  return {
    opportunityId,
    emergedAtTick: emissionEvent.kernelTickId,
    originDemandClusterId: originClusterId,
    originSupplySignalId: supplySignalId,
    phaseTransitions,
    relatedEvents: [...clusterEvents, emissionEvent]
  };
}
