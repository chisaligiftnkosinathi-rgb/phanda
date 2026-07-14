import { fetchOpportunities } from '@/api/opportunityApi';
import { fetchOpportunities as fetchPublicOpportunities } from '@/api/publicProfileApi';
import { DemandSignal } from '@/types/demand';
import { OpportunityRepository } from './interfaces';
import { CityQuery, GeoQuery } from '@/types/locality';
import { mapOpportunityToDemandSignal } from '@/adapters/opportunityAdapter';

// ---------------------------------------------------------------------------
// Live API-backed OpportunityRepository.
// Sprint 4: mocks/demandEconomy.ts no longer provides seed demand signals.
//
// Two API sources combined:
//   opportunityApi.ts    — authenticated user's own opportunities
//   publicProfileApi.ts  — publicly searchable opportunities
// ---------------------------------------------------------------------------

export class ApiOpportunityRepository implements OpportunityRepository {

  async getDemandSignals(): Promise<DemandSignal[]> {
    const raw = await fetchOpportunities();
    return raw.map(mapOpportunityToDemandSignal);
  }

  async getDemandSignalsByCity(query: CityQuery): Promise<DemandSignal[]> {
    const raw = await fetchPublicOpportunities({
      city: query.cityId,
      province: query.province,
    });
    const rawArr = Array.isArray(raw) ? raw : [];
    return rawArr.map(mapOpportunityToDemandSignal);
  }

  async getDemandSignalsNear(query: GeoQuery): Promise<DemandSignal[]> {
    const raw = await fetchOpportunities({
      lat: query.lat,
      lng: query.lng,
      radius_km: query.radiusKm,
    });
    return raw.map(mapOpportunityToDemandSignal);
  }
}
