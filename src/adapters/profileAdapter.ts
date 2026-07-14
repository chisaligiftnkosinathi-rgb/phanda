import { StewardProfile } from '@/types/steward';
import { SupplySignal } from '@/types/supply';

// ---------------------------------------------------------------------------
// FieldSource Legend (per API Contract Audit):
//   Direct   — 1:1 from API field
//   Derived  — deterministically computed from API data
//   Runtime  — mutable simulation state; default at bootstrap only
//   Computed — computed by a physics engine, not stored
// ---------------------------------------------------------------------------

/**
 * Resolves availability from profile data.
 * Source: Runtime — API asserts no value. Defaults to 1.0 at bootstrap.
 * Future: replace with a RepositoryAvailabilityResolver backed by shift/calendar data.
 */
function resolveAvailability(_profile: StewardProfile): number {
  // Bootstrap default. Marked as Runtime — never treat as an API fact.
  return 1.0;
}

/**
 * Derives a deterministic trust stability seed from profile metadata.
 * Source: Derived from API verification fields.
 */
function deriveTrustStability(profile: StewardProfile): number {
  // Seed from trust_posture if available, otherwise default to neutral.
  const postureMap: Record<string, number> = {
    high: 0.9,
    medium: 0.65,
    low: 0.4,
  };
  const raw = profile.trust_posture?.toLowerCase() ?? '';
  return postureMap[raw] ?? 0.5;
}

/**
 * Maps an operational StewardProfile DTO into a computational SupplySignal.
 *
 * RULE: This adapter is the only place StewardProfile may be consumed.
 *       Repositories and the Engine never import or read StewardProfile directly.
 */
export function mapProfileToSupplySignal(profile: StewardProfile): SupplySignal {
  return {
    // Direct mappings
    id: profile.id,
    personId: profile.owner_id ?? profile.uid,
    capability: 'ACTIVE',

    // Derived — extracted from nullable API coordinates
    location: {
      lat: 0,
      lng: 0,
      label: profile.address_label ?? profile.city ?? undefined,
    },

    // Runtime defaults — clearly NOT API facts
    capacity: 1.0,          // FieldSource: Runtime
    availability: resolveAvailability(profile),  // FieldSource: Runtime
    responsiveness: 0.7,    // FieldSource: Runtime
    fatigue: 0.0,           // FieldSource: Runtime (FatigueAccumulator.get(personId) when live)
    drift: 0.0,             // FieldSource: Runtime (decays over time in physics engine)

    // Derived — computed deterministically from API profile metadata
    trustStability: deriveTrustStability(profile),  // FieldSource: Derived

    lastUpdated: new Date().toISOString(),
    lastActionCompletedAt: undefined, // FieldSource: Runtime (populated from completed job history)
  };
}
