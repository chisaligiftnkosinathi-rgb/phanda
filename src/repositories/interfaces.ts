import { SupplySignal } from '@/types/supply';
import { DemandSignal } from '@/types/demand';
import { TrustEdge } from '@/types/trustGraph';
import { IdentitySnapshot } from './identityRepository';
import { City, Province, Country, CityQuery, GeoQuery } from '@/types/locality';

// ---------------------------------------------------------------------------
// THE FIVE ARCHITECTURAL TRUTHS
//
// API        → Operational Truth   (persists/serves real application data)
// Repository → Translation Truth   (maps DTOs to engine domain models)
// Snapshot   → Decision Truth      (immutable frozen state for one kernel tick)
// Engine     → Computational Truth (deterministic decisions from snapshots)
// Ledger     → Historical Truth    (what happened and why)
//
// RULE: Repositories return ONLY domain models. DTOs terminate inside adapters.
// ---------------------------------------------------------------------------

export interface ProfileRepository {
  /**
   * Returns domain-model SupplySignals. Never returns raw StewardProfile DTOs.
   * All derivation and transformation happens inside the adapter, not here.
   */
  getSupplySignals(): Promise<SupplySignal[]>;
  getSupplySignalsByCity(query: CityQuery): Promise<SupplySignal[]>;
  getSupplySignalsNear(query: GeoQuery): Promise<SupplySignal[]>;
}

export interface OpportunityRepository {
  getDemandSignals(): Promise<DemandSignal[]>;
  getDemandSignalsByCity(query: CityQuery): Promise<DemandSignal[]>;
  getDemandSignalsNear(query: GeoQuery): Promise<DemandSignal[]>;
}

/**
 * LocationRepository — single source of truth for geographic data.
 * The UI never hard-codes city lists. Enables future multi-country expansion.
 */
export interface LocationRepository {
  getCountries(): Promise<Country[]>;
  getProvinces(countryCode: string): Promise<Province[]>;
  getCities(province: string): Promise<City[]>;
  searchCities(query: string): Promise<City[]>;
}

export interface TrustRepository {
  getTrustEdges(): Promise<TrustEdge[]>;
}

export interface IdentityRepositoryInterface {
  getIdentitySnapshot(): Promise<IdentitySnapshot>;
}

/**
 * Composed interface consumed by the SnapshotFactory.
 */
export interface EconomyRepository {
  profiles: ProfileRepository;
  opportunities: OpportunityRepository;
  trust: TrustRepository;
  identity: IdentityRepositoryInterface;
  location: LocationRepository;
}
