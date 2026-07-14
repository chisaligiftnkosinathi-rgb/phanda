import { SupplySignal } from '@/types/supply';

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Computes the total Readiness Pressure of a pool of supply signals.
 * Supply is modeled as elastic resistance: high capacity + high availability creates strong resistance.
 * Fatigue and drift diminish supply strength.
 */
export function computeSupplyPressure(signals: SupplySignal[]): number {
  let totalPressure = 0;

  for (const signal of signals) {
    const capacity = clamp(signal.capacity);
    const availability = clamp(signal.availability);
    const responsiveness = clamp(signal.responsiveness);
    const trustStability = clamp(signal.trustStability);
    const fatigue = clamp(signal.fatigue);
    const drift = clamp(signal.drift);

    const signalPressure = 
      capacity * 
      availability * 
      responsiveness * 
      trustStability * 
      (1 - fatigue) * 
      (1 - drift);

    totalPressure += signalPressure;
  }

  return totalPressure;
}
