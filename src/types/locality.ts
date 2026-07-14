// ---------------------------------------------------------------------------
// Locality — First-class geographic hierarchy for iPhande.
//
// Humans think geographically. A plumber in Cape Town is irrelevant
// to someone in Pretoria needing urgent plumbing.
//
// The engine uses lat/lng for precise physics calculations.
// The application organizes discovery around named places.
//
// Country -> Province -> District -> Municipality -> City/Town -> Suburb
// ---------------------------------------------------------------------------

export interface Country {
  code: string;   // ISO 3166-1 alpha-2 (e.g. "ZA")
  name: string;
}

export interface Province {
  id: string;
  name: string;
  countryCode: string;
}

export interface City {
  id: string;
  name: string;
  province: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

// ---------------------------------------------------------------------------
// Locality query parameters used by repositories.
// "Where" is separate from "how far" — intentional design.
// ---------------------------------------------------------------------------

export interface CityQuery {
  cityId?: string;       // Named city anchor
  province?: string;     // Fallback to province-level
  countryCode?: string;
}

export interface GeoQuery {
  lat: number;
  lng: number;
  radiusKm: number;
}

export type LocalityQuery =
  | { type: 'city'; city: CityQuery }
  | { type: 'geo'; geo: GeoQuery }
  | { type: 'all' };
