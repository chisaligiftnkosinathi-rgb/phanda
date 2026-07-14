import { TrustEdge } from '@/types/trustGraph';
import { TrustRepository } from './interfaces';
import { StewardProfile } from '@/types/steward';
import { fetchWithAuth } from '@/config/api';
import { mapProfileToTrustObservations, computeTrustEdges } from '@/adapters/trustAdapter';

// ---------------------------------------------------------------------------
// Live API-backed TrustRepository.
// Implements the 3-stage pipeline: API Evidence -> Observation -> TrustEdge
//
// TrustEdges are NEVER fetched directly from Supabase as raw data.
// They are always computed from observations, preserving explainability.
// ---------------------------------------------------------------------------

export class ApiTrustRepository implements TrustRepository {

  async getTrustEdges(): Promise<TrustEdge[]> {
    // Fetch the pool of active steward profiles as trust evidence
    const profiles: StewardProfile[] = await fetchWithAuth('/public/profiles');

    // Stage 1: Extract observations from raw API evidence
    const observations = profiles.flatMap(mapProfileToTrustObservations);

    // Stage 2 + 3: Compute TrustEdges from evidence weights
    return computeTrustEdges(observations);
  }
}
