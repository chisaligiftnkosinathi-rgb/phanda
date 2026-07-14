import { fetchWithAuth } from '@/config/api';
import { StewardProfile } from '@/types/steward';
import { SupplySignal } from '@/types/supply';
import { ProfileRepository } from './interfaces';
import { CityQuery, GeoQuery } from '@/types/locality';
import { mapProfileToSupplySignal } from '@/adapters/profileAdapter';

// ---------------------------------------------------------------------------
// The first live API-backed repository.
// Sprint 4: mocks/publicEconomy.ts is no longer the source of supply data.
//
// RULE: This file is the ONLY place fetchWithAuth('/public/profiles') is called
//       for supply discovery. All returned data is immediately transformed
//       via mapProfileToSupplySignal() before leaving this module.
// ---------------------------------------------------------------------------

export class ApiProfileRepository implements ProfileRepository {

  async getSupplySignals(): Promise<SupplySignal[]> {
    try {
      const raw: StewardProfile[] = await fetchWithAuth('/public/profiles');
      return raw.map(mapProfileToSupplySignal);
    } catch (err: any) {
      // Backend is returning 500 on GET /public/profiles — tracked issue.
      // Return empty supply signals so the engine kernel can continue ticking
      // without crashing the marketplace UI into an error state.
      console.warn(
        `[ProfileRepository] GET /public/profiles failed (status=${err?.status ?? 'unknown'}). ` +
        'Marketplace will show empty supply until the backend recovers.',
        err?.message ?? err
      );
      return [];
    }
  }

  async getSupplySignalsByCity(query: CityQuery): Promise<SupplySignal[]> {
    const params = new URLSearchParams();
    if (query.cityId) params.append('city', query.cityId);
    if (query.province) params.append('province', query.province);
    if (query.countryCode) params.append('country', query.countryCode);

    const qs = params.toString();
    try {
      const raw: StewardProfile[] = await fetchWithAuth(
        `/public/profiles${qs ? `?${qs}` : ''}`
      );
      return raw.map(mapProfileToSupplySignal);
    } catch (err: any) {
      console.warn(
        `[ProfileRepository] GET /public/profiles (city query) failed (status=${err?.status ?? 'unknown'}).`,
        err?.message ?? err
      );
      return [];
    }
  }

  async getSupplySignalsNear(query: GeoQuery): Promise<SupplySignal[]> {
    const params = new URLSearchParams({
      lat: String(query.lat),
      lng: String(query.lng),
      radius_km: String(query.radiusKm),
    });

    try {
      const raw: StewardProfile[] = await fetchWithAuth(
        `/public/profiles/nearby?${params.toString()}`
      );
      return raw.map(mapProfileToSupplySignal);
    } catch (err: any) {
      console.warn(
        `[ProfileRepository] GET /public/profiles/nearby failed (status=${err?.status ?? 'unknown'}).`,
        err?.message ?? err
      );
      return [];
    }
  }
}
