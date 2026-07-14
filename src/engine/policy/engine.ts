import { PolicyState, PolicyLevel } from './types';
import { SystemSnapshot } from '../kernel/snapshot';
import { ForecastState } from '../forecast/types';
import { BackpressureMetrics, computeExecutionLoadFactor } from '../kernel/backpressure';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates weighted collapse density from forecast projections.
 * Does NOT just count events; weighs them by physical intensity and certainty.
 */
function calculateWeightedCollapseDensity(forecast: ForecastState): number {
  let totalWeight = 0;
  const configuredRegionalCapacity = 10; // Prototype configuration

  for (const tick of forecast.projections) {
    for (const transition of tick.projectedTransitions) {
      if (transition.state === "LOCKED") {
        // Retrieve original demand cluster to get pressure
        const cluster = tick.demand.find(c => c.id === transition.clusterId);
        const pressure = cluster ? cluster.pressure : 0.5;

        // In a real system, trustDensity and alignmentScore would be attached to the transition or cluster.
        const trustDensity = 0.8; 
        const alignmentScore = 0.9;

        const weight = pressure * tick.confidence * trustDensity * alignmentScore;
        totalWeight += weight;
      }
    }
  }

  return clamp(totalWeight / configuredRegionalCapacity, 0, 1);
}

/**
 * The core Policy Engine Evaluator.
 * Pure function: Interprets physical state and predictions to define governance boundaries.
 */
export function evaluateSystemPolicy(
  snapshot: SystemSnapshot,
  forecast: ForecastState,
  metrics: BackpressureMetrics
): PolicyState {
  
  const loadFactor = computeExecutionLoadFactor(metrics);
  const forecastedCollapseDensity = calculateWeightedCollapseDensity(forecast);

  // Mocks for prototype variables (would normally be derived from full snapshot graph analysis)
  const systemVolatility = 0.4;
  const trustInstability = 0.2;
  const supplyStress = 0.3;
  const fraudRisk = 0.1;
  const demandOverheat = forecastedCollapseDensity > 0.6 ? 0.8 : 0.3;
  const forecastConfidence = forecast.projections.length > 0 ? forecast.projections[0].confidence : 1.0;

  // The Governance Formula
  const riskScore = clamp(
    (systemVolatility * 0.3) +
    (loadFactor * 0.25) +
    (forecastedCollapseDensity * 0.25) +
    (trustInstability * 0.2),
    0,
    1
  );

  let interventionLevel: PolicyLevel = "NORMAL";
  if (riskScore >= 0.8) {
    interventionLevel = "EMERGENCY_FREEZE";
  } else if (riskScore >= 0.6) {
    interventionLevel = "RESTRICT";
  } else if (riskScore >= 0.4) {
    interventionLevel = "THROTTLE";
  }

  return {
    timestamp: snapshot.timestamp,
    systemRisk: riskScore,
    loadFactor,
    fraudRisk,
    supplyStress,
    demandOverheat,
    forecastConfidence,
    interventionLevel
  };
}
