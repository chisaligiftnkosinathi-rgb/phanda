import { toISOFromTick } from '@/engine/kernel/deterministicId';
import { TrustEdge } from '@/types/trustGraph';

/**
 * Deterministically updates or creates trust edges between entities.
 */
export function updateEdge(
  edge: TrustEdge | undefined,
  fromEntityId: string,
  toEntityId: string,
  isSuccess: boolean,
  impact: number,
  stabilityMultiplier: number,
  currentTimestamp: number
): TrustEdge {
  const nowISO = toISOFromTick(currentTimestamp);

  // CREATE NEW EDGE
  if (!edge) {
    return {
      id: `edge_${fromEntityId}_${toEntityId}`,
      fromEntityId,
      toEntityId,
      weight: isSuccess ? impact * stabilityMultiplier : 0,
      interactions: 1,
      successRate: isSuccess ? 1.0 : 0.0,
      lastInteraction: nowISO,
    };
  }

  // UPDATE EXISTING EDGE
  const newInteractions = edge.interactions + 1;

  const newSuccessCount =
    edge.successRate * edge.interactions + (isSuccess ? 1 : 0);

  const newSuccessRate = newSuccessCount / newInteractions;

  let newWeight = edge.weight;

  if (isSuccess) {
    newWeight += impact * stabilityMultiplier;
  } else {
    newWeight -= impact * 2;
  }

  newWeight = Math.max(0, Math.min(1, newWeight));

  return {
    ...edge,
    weight: newWeight,
    interactions: newInteractions,
    successRate: newSuccessRate,
    lastInteraction: nowISO,
  };
}
