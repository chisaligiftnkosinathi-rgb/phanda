/**
 * Calculates the confidence of a forecast simulation at a specific future tick.
 * confidence = baseConfidence * (0.85 ^ tickIndex)
 */
export function calculateForecastConfidence(
  tickIndex: number,
  trustStability: number = 0.8,
  dataDensity: number = 1.0,
  historicalAccuracy: number = 0.9,
  systemVolatilityInverse: number = 0.9
): number {
  const baseConfidence = trustStability * dataDensity * historicalAccuracy * systemVolatilityInverse;
  
  // Exponential entropy decay per future tick
  const entropyDecay = Math.pow(0.85, tickIndex);
  
  return Math.max(0, Math.min(1, baseConfidence * entropyDecay));
}
