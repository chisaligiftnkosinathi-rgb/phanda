import { Country, Province, City } from '@/types/locality';
import { LocationRepository } from './interfaces';
import { fetchWithAuth } from '@/config/api';

// ---------------------------------------------------------------------------
// LocationRepository — single source of truth for geographic hierarchy data.
// The UI never hard-codes city lists or province arrays.
//
// Starts with South Africa (ZA). Architecture supports multi-country expansion
// without any changes above the repository layer.
// ---------------------------------------------------------------------------

export class ApiLocationRepository implements LocationRepository {

  async getCountries(): Promise<Country[]> {
    // Initially seeded locally; future: fetch from /public/geo/countries
    return [
      { code: 'ZA', name: 'South Africa' },
    ];
  }

  async getProvinces(countryCode: string): Promise<Province[]> {
    if (countryCode !== 'ZA') return [];
    // Future: fetch from /public/geo/provinces?country=ZA
    return [
      { id: 'GP', name: 'Gauteng', countryCode: 'ZA' },
      { id: 'WC', name: 'Western Cape', countryCode: 'ZA' },
      { id: 'KZN', name: 'KwaZulu-Natal', countryCode: 'ZA' },
      { id: 'EC', name: 'Eastern Cape', countryCode: 'ZA' },
      { id: 'FS', name: 'Free State', countryCode: 'ZA' },
      { id: 'LP', name: 'Limpopo', countryCode: 'ZA' },
      { id: 'MP', name: 'Mpumalanga', countryCode: 'ZA' },
      { id: 'NW', name: 'North West', countryCode: 'ZA' },
      { id: 'NC', name: 'Northern Cape', countryCode: 'ZA' },
    ];
  }

  async getCities(province: string): Promise<City[]> {
    // Future: fetchWithAuth(`/public/geo/cities?province=${province}`)
    const raw = await fetchWithAuth(`/public/geo/cities?province=${province}`).catch(() => []);
    return Array.isArray(raw) ? raw as City[] : [];
  }

  async searchCities(query: string): Promise<City[]> {
    const raw = await fetchWithAuth(
      `/public/geo/cities?q=${encodeURIComponent(query)}`
    ).catch(() => []);
    return Array.isArray(raw) ? raw as City[] : [];
  }
}
