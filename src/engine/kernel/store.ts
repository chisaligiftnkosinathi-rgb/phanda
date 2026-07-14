import { DemandCluster, DemandSignal } from '@/types/demand';
import { SupplySignal, SupplyField } from '@/types/supply';
import { TrustEdge } from '@/types/trustGraph';
import { OpportunityEntity, MarketplaceEntity } from '@/types/marketplace';

// Initial mocks used ONLY for seeding the store
import { mockDemandSignals } from '@/mocks/demandEconomy';
import { mockSupplySignals } from '@/mocks/supplyEconomy';

export interface EconomyState {
  demand: {
    signals: DemandSignal[];
    clusters: DemandCluster[];
  };
  supply: {
    signals: SupplySignal[];
  };
  trustGraph: {
    edges: TrustEdge[];
  };
  opportunities: OpportunityEntity[];
  cooldowns: {
    cluster: Record<string, number>;
    supply: Record<string, number>;
  };
}

class EconomyStore {
  private state: EconomyState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): EconomyState {
    return {
      demand: {
        signals: JSON.parse(JSON.stringify(mockDemandSignals || [])),
        clusters: [], // Clusters are computed by DemandClustering engine at runtime
      },
      supply: {
        signals: JSON.parse(JSON.stringify(mockSupplySignals || [])),
      },
      trustGraph: {
        edges: [], // Would normally be seeded from a trust mock
      },
      opportunities: [], // Spawned opportunities live here
      cooldowns: {
        cluster: {},
        supply: {},
      }
    };
  }

  public getState(): EconomyState {
    // Return a deeply cloned snapshot to ensure UI/Engines cannot mutate state directly
    return JSON.parse(JSON.stringify(this.state));
  }

  public applyMutations(mutations: Partial<EconomyState>) {
    this.state = {
      ...this.state,
      ...mutations,
    };
  }

  public replaceState(newState: EconomyState) {
    this.state = JSON.parse(JSON.stringify(newState));
  }
}

export const store = new EconomyStore();
