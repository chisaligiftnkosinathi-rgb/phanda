import { TrustField } from '@/types/marketplace';

export function calculateStability(currentField: TrustField, newVelocity: number): number {
  // Stability is dampened by high variance in velocity.
  // If velocity is huge, stability drops.
  
  // Calculate variance: how far is the new velocity from the current velocity?
  const variance = Math.abs(currentField.velocity - newVelocity);
  
  // High variance = low stability
  let newStability = 1 / (1 + variance * 0.1);

  // Blend with previous stability so it doesn't instantly snap
  // 70% memory, 30% new
  newStability = (currentField.stability * 0.7) + (newStability * 0.3);
  
  // Clamp to 0-1
  return Math.max(0, Math.min(1, newStability));
}
