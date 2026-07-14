import { OpportunityOut } from '@/types/opportunity';
import { DemandSignal, DemandSignalSource } from '@/types/demand';

// ---------------------------------------------------------------------------
// Urgency Policy — Category-aware urgency resolver.
// Adapters call this policy rather than owning the logic themselves.
// This allows different domains (healthcare, logistics, agriculture) to
// inject different urgency rules later without touching adapter code.
// ---------------------------------------------------------------------------
function resolveUrgency(opp: OpportunityOut): number {
  // FieldSource: Computed
  // Future: UrgencyPolicy(createdAt, category, optional SLA, manual priority)
  const createdAt = opp.created_at ? new Date(opp.created_at).getTime() : Date.now();
  const ageMs = Date.now() - createdAt;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  // Urgency rises as the opportunity ages, capped at 0.95
  const timeUrgency = Math.min(0.95, ageDays * 0.1);
  return Math.max(0.1, timeUrgency);
}

/**
 * Maps an operational OpportunityOut DTO into a computational DemandSignal.
 *
 * RULE: This adapter is the only place OpportunityOut may be consumed.
 *       An OpportunityOut is a business object (already visible to users).
 *       A DemandSignal is a physical pressure measurement (market physics).
 *       These are distinct concepts at distinct stages of emergence.
 */
export function mapOpportunityToDemandSignal(opp: OpportunityOut): DemandSignal {
  // Direct: status translation
  const statusMap: Record<string, DemandSignal['status']> = {
    open: 'active',
    contacted: 'active',
    quoted: 'active',
    closed: 'collapsed',
  };

  return {
    // Direct mappings
    id: opp.id,
    category: opp.category_key ?? 'unknown',

    // Derived from nullable API coordinates
    location: {
      lat: opp.latitude ?? undefined,
      lng: opp.longitude ?? undefined,
      label: opp.town_or_city ?? opp.suburb_or_area ?? undefined,
    },

    // Computed — not stored in the API
    intensity: resolveUrgency(opp),   // FieldSource: Computed via UrgencyPolicy
    confidence: 0.8,                  // FieldSource: Runtime (initial seed; rises with repeat signals)
    decayRate: 0.05,                  // FieldSource: Runtime (physics engine governs)

    sources: ['manual' as DemandSignalSource], // FieldSource: Derived (explicit user-posted jobs = manual)

    // Derived from API status
    status: statusMap[opp.status] ?? 'active',
    collapsedAt: opp.status === 'closed' ? new Date().toISOString() : undefined,
    collapsedOpportunityId: undefined,

    lastUpdated: opp.created_at ?? new Date().toISOString(),
  };
}
