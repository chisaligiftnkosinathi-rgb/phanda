import { SupplySignal } from '@/types/supply';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Computes Supply Decay (Idle Drift).
 * Idle workers slowly fade into economic invisibility.
 * drift = 1.0 - exp(-timeAwayFromWork * driftMultiplier)
 */
export function calculateSupplyDrift(
  signal: SupplySignal,
  currentTime: number,
  driftMultiplier: number = 0.05
): number {
  // Deterministic date handling: lastUpdated / lastActionCompletedAt are ISO strings
  // Convert ISO → epoch ms without using wall-clock Date object construction.

  const baselineTime = signal.lastActionCompletedAt
    ? Date.parse(signal.lastActionCompletedAt)
    : Date.parse(signal.lastUpdated);


  const daysIdle = Math.max(0, (currentTime - baselineTime) / MS_PER_DAY);


  // Exponential decay function to simulate attention loss and economic disconnect
  // Exp approaches 0 as daysIdle increases, so (1 - exp) approaches 1.0 drift.
  const drift = 1.0 - Math.exp(-daysIdle * driftMultiplier);

  return Math.max(0, Math.min(1, drift));
}
