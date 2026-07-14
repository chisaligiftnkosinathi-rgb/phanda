import { TrustField } from '@/types/marketplace';
import { TrustEdge } from '@/types/trustGraph';

/**
 * Computes Second Order Trust (Reputation Reflection).
 *
 * Determinism rule:
 * - This function is pure w.r.t. (entityId, edges, getCounterpartyTrust, currentTimestamp)
 * - It has no cross-call hidden cache/state.
 */
export function calculateReflection(
  entityId: string,
  edges: TrustEdge[],
  getCounterpartyTrust: (id: string) => TrustField | undefined,
  _currentTimestamp: number
): number {
  let reflectedTrust = 0;

  for (const edge of edges) {
    // We only care about edges pointing TO the entity
    if (edge.toEntityId !== entityId) continue;

    const counterparty = getCounterpartyTrust(edge.fromEntityId);
    if (!counterparty) continue;

    const counterpartyNormalized = counterparty.value / 100;

    // Stability factor: strong repeated relationships stabilize influence
    const stabilityFactor = 1 / (1 + (1 / (edge.interactions <= 0 ? 1 : edge.interactions)));

    reflectedTrust += (edge.weight * counterpartyNormalized * stabilityFactor);
  }

  const finalScore = reflectedTrust * 10;
  return finalScore;
}

/**
 * Backwards-compatible API: no cache exists anymore.
 */
export function invalidateReflectionCache(_entityId: string) {
  // no-op
}
