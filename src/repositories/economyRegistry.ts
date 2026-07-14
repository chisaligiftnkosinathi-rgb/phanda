import { EconomyRepository } from './interfaces';
import { ApiProfileRepository } from './profileRepository';
import { ApiOpportunityRepository } from './opportunityRepository';
import { ApiTrustRepository } from './trustRepository';
import { ApiLocationRepository } from './locationRepository';

// ---------------------------------------------------------------------------
// The production EconomyRepository — wires all live API-backed implementations.
//
// The Kernel and SnapshotFactory consume only the EconomyRepository interface.
// Swapping any implementation (mock → API → test) requires changing only here.
// ---------------------------------------------------------------------------

export function createProductionEconomyRepository(): EconomyRepository {
  return {
    profiles: new ApiProfileRepository(),
    opportunities: new ApiOpportunityRepository(),
    trust: new ApiTrustRepository(),
    location: new ApiLocationRepository(),
    identity: {
      async getIdentitySnapshot() {
        // Placeholder: will read from AuthContext once wired
        return {
          actorId: 'unknown',
          stewardProfileId: null,
          role: 'unknown' as const,
          permissions: [],
        };
      }
    }
  };
}

// ---------------------------------------------------------------------------
// Mock EconomyRepository — used during tests and offline development.
// Swap this in instead of createProductionEconomyRepository() to run the
// kernel entirely against controlled seed data without any API calls.
// ---------------------------------------------------------------------------
import { mockDemandSignals } from '@/mocks/demandEconomy';
import { mockSupplySignals } from '@/mocks/supplyEconomy';

export function createMockEconomyRepository(): EconomyRepository {
  return {
    profiles: {
      async getSupplySignals() { return mockSupplySignals; },
      async getSupplySignalsByCity(_q) { return mockSupplySignals; },
      async getSupplySignalsNear(_q) { return mockSupplySignals; },
    },
    opportunities: {
      async getDemandSignals() { return mockDemandSignals; },
      async getDemandSignalsByCity(_q) { return mockDemandSignals; },
      async getDemandSignalsNear(_q) { return mockDemandSignals; },
    },
    trust: {
      async getTrustEdges() { return []; },
    },
    location: {
      async getCountries() { return [{ code: 'ZA', name: 'South Africa' }]; },
      async getProvinces(_c) { return []; },
      async getCities(_p) { return []; },
      async searchCities(_q) { return []; },
    },
    identity: {
      async getIdentitySnapshot() {
        return { actorId: 'mock-actor', stewardProfileId: null, role: 'steward', permissions: [] };
      }
    }
  };
}
