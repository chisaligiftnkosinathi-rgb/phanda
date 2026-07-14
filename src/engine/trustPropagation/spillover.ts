import { TrustEdge } from '@/types/trustGraph';

/**
 * Calculates network spillover (Trust Leakage).
 * A strong connection creates a small ambient trust boost to the 
 * counterparty in unrelated contexts.
 */
export function calculateSpillover(edge: TrustEdge): number {
  // Spillover is 10% of edge weight
  return edge.weight * 0.1;
}
