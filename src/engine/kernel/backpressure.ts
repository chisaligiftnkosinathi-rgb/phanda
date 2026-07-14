export interface BackpressureMetrics {
  lockedEventsLastTick: number;
  evaluationsLastTick: number;
}

const MAX_LOCKED_PER_TICK = 5;
const MAX_EVALUATIONS_PER_TICK = 50;

/**
 * Calculates the Execution Load Factor (0.1 -> 1.0) based on system strain.
 * This throttle protects against runaway job generation, UI flooding, and cascading collapse loops.
 */
export function computeExecutionLoadFactor(metrics: BackpressureMetrics): number {
  if (metrics.lockedEventsLastTick === 0 && metrics.evaluationsLastTick === 0) {
    return 1.0;
  }

  const lockStrain = Math.min(1.0, metrics.lockedEventsLastTick / MAX_LOCKED_PER_TICK);
  const evalStrain = Math.min(1.0, metrics.evaluationsLastTick / MAX_EVALUATIONS_PER_TICK);
  
  // Use whichever strain is higher
  const peakStrain = Math.max(lockStrain, evalStrain);

  // If strain is 1.0 (maxed out), load factor drops to 0.1 (severe throttle)
  // If strain is 0.0 (no load), load factor is 1.0 (full speed)
  const factor = 1.0 - (peakStrain * 0.9);
  
  return Math.max(0.1, factor);
}
