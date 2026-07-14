import { toISOFromTick } from '@/engine/kernel/deterministicId';
import { TrustEvent } from '@/engine/trustPhysics';
import { DemandCluster } from '@/types/demand';

interface ReinforceResult {
  updatedCluster: DemandCluster;
  trustEvent: TrustEvent;
}

/**
 * Signal Reinforcement Engine
 * Deterministic trust-driven cluster reinforcement.
 */
export function reinforceCluster(
  cluster: DemandCluster,
  userId: string,
  userTrustScore: number,
  currentTimestamp: number
): ReinforceResult | null {
  // Only trusted users can reinforce
  if (userTrustScore < 60) return null;

  const influenceWeight = userTrustScore / 100;

  const newConfidence = Math.min(
    1.0,
    cluster.totalConfidence + 0.05 * influenceWeight
  );

  const newVelocity = Math.min(
    1.0,
    cluster.velocity + 0.02 * influenceWeight
  );

  const updatedCluster: DemandCluster = {
    ...cluster,
    totalConfidence: newConfidence,
    velocity: newVelocity,
    lastUpdated: toISOFromTick(currentTimestamp),
  };

  const trustEvent: TrustEvent = {
    actorId: userId,
    targetId: cluster.id,
    type: 'EVIDENCE_ADDED',
    timestamp: currentTimestamp,
  };

  return {
    updatedCluster,
    trustEvent,
  };
}
