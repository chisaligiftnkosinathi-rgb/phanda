import { apiClient } from './client';
import { OpportunityCreate, OpportunityOut, OpportunityUpdate } from '../types/opportunity';

export interface OpportunityFilters {
  profile_id?: string;
  province?: string;
  town_or_city?: string;
  place_code?: string;
  category_key?: string;
  q?: string;
  lat?: number;
  lng?: number;
  radius_km?: string | number;
}

export const opportunityApi = {
  fetchOpportunities: async (filters?: OpportunityFilters): Promise<OpportunityOut[]> => {
    let endpoint = '/opportunities';
    const params: Record<string, any> = {};

    if (filters) {
      if (filters.profile_id) params.profile_id = filters.profile_id;
      if (filters.province) params.province = filters.province;
      if (filters.town_or_city) params.town_or_city = filters.town_or_city;
      if (filters.place_code) params.place_code = filters.place_code;
      if (filters.category_key) params.category_key = filters.category_key;
      if (filters.q) params.q = filters.q;

      if (filters.lat !== undefined && filters.lng !== undefined) {
        endpoint = '/opportunities/nearby';
        params.lat = filters.lat;
        params.lng = filters.lng;
        if (filters.radius_km) params.radius_km = filters.radius_km;
      }
    }

    const response = await apiClient.get<OpportunityOut[]>(endpoint, { params });
    return response.data;
  },

  createOpportunity: async (data: OpportunityCreate): Promise<OpportunityOut> => {
    const response = await apiClient.post<OpportunityOut>('/opportunities', data);
    return response.data;
  },

  updateOpportunity: async (id: string, update: OpportunityUpdate): Promise<OpportunityOut> => {
    const response = await apiClient.patch<OpportunityOut>(`/opportunities/${id}`, update);
    return response.data;
  },

  fetchOpportunityById: async (id: string): Promise<OpportunityOut> => {
    const response = await apiClient.get<OpportunityOut>(`/opportunities/${id}`);
    return response.data;
  }
};

// -------------------------------------------------------
// NAMED EXPORT SHIMS (consumed by screens directly)
// -------------------------------------------------------

/** Fetch opportunities with optional filters. */
export const fetchOpportunities = opportunityApi.fetchOpportunities;

/** Update an opportunity by ID. */
export const updateOpportunity = opportunityApi.updateOpportunity;

