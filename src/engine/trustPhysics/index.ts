import { TrustAnchorClass, TrustField } from '@/types/marketplace';
import { TrustEdge } from '@/types/trustGraph';
import { toISOFromTick } from '../kernel/deterministicId';
import { updateEdge } from '../trustPropagation/edgeFormation';
import { invalidateReflectionCache } from '../trustPropagation/reflection';
import { calculateSpillover } from '../trustPropagation/spillover';
import { calculateDecay } from './decay';
import { calculateEvidenceMultiplier } from './evidence';
import { calculateGain } from './gain';
import { calculateStability } from './stability';
import { TrustEvent } from './types';


export * from './types';

function computeAnchorClass(value: number): TrustAnchorClass {
  if (value < 30) return 'UNSTABLE';
  if (value < 60) return 'EMERGING';
  if (value < 80) return 'RELIABLE';
  if (value < 95) return 'PROVEN';
  return 'ANCHOR';
}

export interface NetworkTrustResult {
  updatedField: TrustField;
  updatedEdge?: TrustEdge;
  spilloverAmount?: number;
}

/**
 * Main engine entry point. Processes an event to update a TrustField,
 * and if applicable, forms/updates the TrustEdge and computes spillover.
 */
export function updateTrust(
  event: TrustEvent,
  currentField: TrustField,
  existingEdge?: TrustEdge
): NetworkTrustResult {
  const currentTime = event.timestamp;

  // 1. Calculate Entropy (Decay)
  const decay = calculateDecay(currentField, currentTime);

  // 2. Calculate Gain (Completion Force)
  const rawGain = calculateGain(event, currentField);

  // 3. Apply Multipliers
  const evidenceMultiplier = calculateEvidenceMultiplier(event);
  const totalGain = rawGain * evidenceMultiplier;

  // 4. Calculate Velocity and Acceleration
  const newVelocity = totalGain - decay;
  const newAcceleration = newVelocity - currentField.velocity;

  // 5. Update Stability
  const newStability = calculateStability(currentField, newVelocity);

  // 6. Compute New Value
  let newValue = currentField.value + (newVelocity * newStability);
  newValue = Math.max(0, Math.min(100, newValue));

  const updatedField: TrustField = {
    value: newValue,
    velocity: newVelocity,
    acceleration: newAcceleration,
    stability: newStability,
    lastUpdated: toISOFromTick(currentTime),


    anchorClass: computeAnchorClass(newValue),
  };

  // Invalidating cache since trust mutated
  invalidateReflectionCache(event.actorId);

  // 7. Network Effects (Propagation Layer)
  let updatedEdge: TrustEdge | undefined = undefined;
  let spilloverAmount = 0;

  if (event.targetId && event.type !== 'SYSTEM_DECAY') {
    const isSuccess = event.type === 'ACTION_COMPLETED' || event.type === 'EVIDENCE_ADDED';

    // Update Edge
    updatedEdge = updateEdge(
      existingEdge,
      event.actorId,
      event.targetId,
      isSuccess,
      totalGain,
      newStability,
      currentTime
    );

    // Compute Spillover for target
    if (isSuccess) {
      spilloverAmount = calculateSpillover(updatedEdge);
    }

    // Invalidate target cache as well since edge changed
    invalidateReflectionCache(event.targetId);
  }

  return { updatedField, updatedEdge, spilloverAmount };
}
