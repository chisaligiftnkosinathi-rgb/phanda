import { DemandSignal } from '@/types/demand';

const MS_PER_HOUR = 1000 * 60 * 60;

/**
 * Computes the real-time thermodynamic pressure of a specific DemandSignal.
 * Pressure = Intensity * Confidence * DecayFactor * Proximity
 */
export function computeFieldPressure(
  signal: DemandSignal,
  currentTime: number,
  proximityMultiplier: number
): number {

  if (signal.status === 'collapsed') return 0;

  const lastUpdated = Date.parse(signal.lastUpdated);
  const hoursSinceUpdate = Math.max(0, (currentTime - lastUpdated) / MS_PER_HOUR);


  // Time decay diminishes the intensity over time based on decayRate
  // e.g. decayRate 0.1 means 10% lost per hour
  const decayFactor = Math.max(0, 1 - (hoursSinceUpdate * signal.decayRate));

  const pressure = signal.intensity * signal.confidence * decayFactor * proximityMultiplier;

  return pressure;
}
