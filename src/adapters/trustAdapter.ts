import { StewardProfile } from '@/types/steward';
import { TrustEdge } from '@/types/trustGraph';

// ---------------------------------------------------------------------------
// Trust Adapter — three explicit stages (per architecture decision):
//
//   API Evidence -> TrustObservation -> TrustInference -> TrustEdge
//
// A TrustEdge is NEVER stored in Supabase as raw data.
// It is always computed from observations, preserving determinism and
// full explainability via the Audit layer.
// ---------------------------------------------------------------------------

export interface TrustObservation {
  subjectId: string;       // FieldSource: Direct (owner_id)
  evidenceType: string;    // FieldSource: Direct (verification_level, trust_posture)
  rawValue: string | null; // FieldSource: Direct (the raw API string value)
  confidenceWeight: number;// FieldSource: Computed (Trust Engine assigns weight)
  source: 'API' | 'Replay';// FieldSource: Runtime
}

/**
 * Step 1: Extract TrustObservations from operational profile data.
 * Source: Derived from API profile metadata fields.
 */
export function mapProfileToTrustObservations(profile: StewardProfile): TrustObservation[] {
  const observations: TrustObservation[] = [];

  // Observation: Verification status
  if (profile.is_verified !== undefined) {
    observations.push({
      subjectId: profile.owner_id ?? profile.uid,
      evidenceType: 'VERIFICATION_LEVEL',
      rawValue: profile.is_verified ? 'verified' : 'unverified',
      confidenceWeight: 0.0,
      source: 'API',
    });
  }

  // Observation: Trust posture
  if (profile.trust_posture) {
    observations.push({
      subjectId: profile.owner_id ?? profile.uid,
      evidenceType: 'TRUST_POSTURE',
      rawValue: profile.trust_posture,
      confidenceWeight: 0.0,
      source: 'API',
    });
  }

  return observations;
}

const CONFIDENCE_WEIGHTS: Record<string, number> = {
  VERIFICATION_LEVEL_verified: 0.20,
  VERIFICATION_LEVEL_unverified: 0.04,
  TRUST_POSTURE_high: 0.15,
  TRUST_POSTURE_medium: 0.08,
  TRUST_POSTURE_low: 0.02,
};

/**
 * Step 2: Compute TrustEdges from TrustObservations.
 *
 * The edge weight is the sum of evidence contributions —
 * making the explanation tree precisely reconstructable:
 *   TrustEdge 0.35
 *   ├── VerificationLevel(high) +0.20
 *   └── TrustPosture(high)      +0.15
 */
export function computeTrustEdges(
  observations: TrustObservation[],
  platformId: string = 'platform'
): TrustEdge[] {
  if (observations.length === 0) return [];

  // Group by subject
  const bySubject = new Map<string, TrustObservation[]>();
  for (const obs of observations) {
    if (!bySubject.has(obs.subjectId)) bySubject.set(obs.subjectId, []);
    bySubject.get(obs.subjectId)!.push(obs);
  }

  const edges: TrustEdge[] = [];

  for (const [subjectId, subjectObs] of bySubject) {
    let totalWeight = 0;

    for (const obs of subjectObs) {
      const key = `${obs.evidenceType}_${obs.rawValue}`;
      const weight = CONFIDENCE_WEIGHTS[key] ?? 0.01;
      obs.confidenceWeight = weight;
      totalWeight += weight;
    }

    edges.push({
      id: `${platformId}_${subjectId}`,
      fromEntityId: platformId,
      toEntityId: subjectId,
      weight: Math.min(1.0, totalWeight),
      interactions: subjectObs.length,
      successRate: totalWeight > 0 ? Math.min(1.0, totalWeight) : 0,
      lastInteraction: new Date().toISOString(),
    });
  }

  return edges;
}
