import { ForecastState } from './types';

export interface OpportunityPrediction {
  probabilityOfCollapse: number;
  expectedTicksToEmergence: number;
  requiredSupplyThreshold: number;
  trustGapSensitivity: "HIGH" | "MEDIUM" | "LOW";
}

/**
 * Predicts the future likelihood and conditions of an opportunity emerging from a cluster.
 */
export function predictOpportunity(
  clusterId: string, 
  forecast: ForecastState
): OpportunityPrediction | null {
  
  for (const tick of forecast.projections) {
    const projectedTransition = tick.projectedTransitions.find(
      t => t.clusterId === clusterId && (t.state === "LOCKED" || t.state === "COMMITTING")
    );

    if (projectedTransition) {
      return {
        probabilityOfCollapse: tick.confidence,
        expectedTicksToEmergence: tick.tickIndex + 1,
        requiredSupplyThreshold: 0.2, // Derived from phase engine constraints
        trustGapSensitivity: "HIGH",
      };
    }
  }

  return null;
}
