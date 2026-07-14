import { SupplySignal } from '@/types/supply';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Simulates forward supply evolution.
 * Predicts fatigue accumulation and availability dropping for heavily utilized workers.
 */
export function projectSupplyTick(supply: SupplySignal, tickIndex: number): SupplySignal {
  // Over future ticks, idle workers drift, and busy workers fatigue.
  // For prototype, we assume static fatigue accumulation in the near future horizon.
  
  const projectedFatigue = clamp(supply.fatigue + (0.02 * (tickIndex + 1)), 0, 1);
  const projectedAvailability = clamp(supply.availability - (0.01 * (tickIndex + 1)), 0, 1);

  return {
    ...supply,
    fatigue: projectedFatigue,
    availability: projectedAvailability
  };
}
