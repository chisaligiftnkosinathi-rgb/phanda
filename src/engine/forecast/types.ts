import { SystemSnapshot } from '../kernel/snapshot';
import { DemandCluster } from '@/types/demand';
import { SupplySignal } from '@/types/supply';
import { PhaseEvent } from '@/types/phaseTransition';
import { OpportunityEntity } from '@/types/marketplace';

export interface ForecastTick {
  tickIndex: number; // 0 = next tick, 1 = tick after, etc.
  demand: DemandCluster[];
  supply: SupplySignal[];

  projectedTransitions: PhaseEvent[];
  projectedOpportunities: OpportunityEntity[];

  confidence: number; // 0-1 (how stable prediction is)
}

export interface ForecastState {
  baseSnapshot: SystemSnapshot;
  horizonTicks: number;
  projections: ForecastTick[];
}
