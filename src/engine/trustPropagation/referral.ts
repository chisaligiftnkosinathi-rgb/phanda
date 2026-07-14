import { TrustField } from '@/types/marketplace';
import { TrustEdge } from '@/types/trustGraph';

/**
 * Calculates the trust weight of a referral.
 * A highly trusted referrer amplifies the introduction.
 * A weak referrer adds almost no credibility.
 */
export function calculateReferralWeight(
  referrerTrustField: TrustField, 
  edgeToTarget: TrustEdge, 
  evidenceMultiplier: number = 1.0
): number {
  // We use the normalized trust value (0-1) of the referrer to weight the edge
  const normalizedReferrerTrust = referrerTrustField.value / 100;
  
  return normalizedReferrerTrust * edgeToTarget.weight * evidenceMultiplier;
}
