import { SupplySignal } from '@/types/supply';

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Calculates the buffering capacity (Elasticity) of the workforce.
 * High-skilled stable workers = high elasticity.
 * Unstable workers = brittle supply.
 * elasticity = average(capacity × trustStability)
 */
export function computeSupplyElasticity(signals: SupplySignal[]): number {
  if (signals.length === 0) return 0;

  let totalElasticity = 0;

  for (const signal of signals) {
    const capacity = clamp(signal.capacity);
    const trustStability = clamp(signal.trustStability);
    totalElasticity += (capacity * trustStability);
  }

  const averageElasticity = totalElasticity / signals.length;
  
  return clamp(averageElasticity);
}
