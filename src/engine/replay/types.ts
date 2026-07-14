import { SystemSnapshot } from '../kernel/snapshot';
import { DemandCluster } from '@/types/demand';
import { SupplySignal } from '@/types/supply';
import { TrustEdge } from '@/types/trustGraph';
import { LedgerEntry } from './ledger';
import { OpportunityEntity } from '@/types/marketplace';
import { PhaseEvent } from '@/types/phaseTransition';

export interface ReplayState {
  tickIndex: number;
  snapshot: SystemSnapshot | null;

  demand: DemandCluster[];
  supply: SupplySignal[];
  trustGraph: TrustEdge[];

  events: LedgerEntry[];

  derived: {
    activeOpportunities: OpportunityEntity[];
    phaseTransitions: PhaseEvent[];
  };
}
