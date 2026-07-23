import { opportunityApi, OpportunityFilters } from '../api/opportunityApi';
import { OpportunityOut, OpportunityCreate } from '../types/opportunity';
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';
// ShadowExecutor removed — shadow comparison is a server-side concern (FastAPI middleware).
// The mobile app only receives the final response from the API.

// UI-specific domain model for the Feed
export interface UIOpportunity {
  id: string;
  title: string;
  creator_name: string;
  creator_trust_score: number;
  visibility_state: string;
  feed_score: number;
  proof_count: number;
  // Fallback for standard fields
  description?: string;
  status?: string;
  location?: string;
  created_at?: string;
  media_thumbnails?: string[];
}

export class OpportunityService {
  static async getOpportunities(filters?: OpportunityFilters): Promise<UIOpportunity[]> {
    try {
      const rawData = await opportunityApi.fetchOpportunities(filters);
      return this.normalizeFeedList(rawData);
    } catch (error) {
      console.error('[OpportunityService] getOpportunities failed:', error);
      throw new Error('Could not fetch opportunities. Please try again later.');
    }
  }

  static async getOpportunityById(id: string): Promise<UIOpportunity> {
    try {
      const rawData = await opportunityApi.fetchOpportunityById(id);
      return this.normalizeFeedItem(rawData);
    } catch (error) {
      console.error(`[OpportunityService] getOpportunityById(${id}) failed:`, error);
      throw new Error('Could not load opportunity details.');
    }
  }

  static async createOpportunity(currentUser: Permission[], data: OpportunityCreate): Promise<UIOpportunity> {
    // 1. Centralized Auth/Permission Check
    TrustPermissionEngine.assertCanCreateOpportunity(currentUser);

    // 2. Network / API call
    try {
      const rawData = await opportunityApi.createOpportunity(data);
      return this.normalizeFeedItem(rawData);
    } catch (error) {
      console.error('[OpportunityService] createOpportunity failed:', error);
      throw new Error('Failed to create opportunity. Please try again.');
    }
  }

  // Domain Normalization Methods
  // The backend might return extra fields in the JSON that aren't strictly in OpportunityOut
  // This layer guarantees the UI gets exactly what it expects.
  private static normalizeFeedList(data: any[]): UIOpportunity[] {
    return data.map(this.normalizeFeedItem);
  }

  private static normalizeFeedItem(item: any): UIOpportunity {
    return {
      id: item.id || '',
      title: item.title || 'Untitled Opportunity',
      creator_name: item.creator_name || 'Anonymous',
      creator_trust_score: typeof item.creator_trust_score === 'number' ? item.creator_trust_score : 0,
      visibility_state: item.visibility_state || 'anonymous',
      feed_score: typeof item.feed_score === 'number' ? item.feed_score : 0,
      proof_count: typeof item.proof_count === 'number' ? item.proof_count : 0,
      description: item.description,
      status: item.status,
      location: [item.suburb_or_area, item.town_or_city].filter(Boolean).join(', ') || undefined,
      created_at: item.created_at,
      media_thumbnails: item.media_thumbnails || [],
    };
  }
}
