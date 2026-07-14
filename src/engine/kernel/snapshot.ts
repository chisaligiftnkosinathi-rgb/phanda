import { DemandCluster, DemandSignal } from '@/types/demand';
import { SupplySignal } from '@/types/supply';
import { TrustEdge } from '@/types/trustGraph';
import { OpportunityEntity } from '@/types/marketplace';

export interface SystemSnapshot {
  timestamp: number;
  
  demand: {
    signals: DemandSignal[];
    clusters: DemandCluster[];
  };
  
  supply: {
    signals: SupplySignal[];
  };
  
  trustEdges: TrustEdge[];
  opportunities: OpportunityEntity[];
  
  cooldowns: {
    cluster: Record<string, number>;
    supply: Record<string, number>;
  };
  
  derived: {
    demandPressureMap: Record<string, number>; // clusterId -> pressure
    supplyElasticityMap: Record<string, number>; // category -> elasticity
    matchTensionMap: Record<string, number>; // clusterId -> matchTension
  };
}
