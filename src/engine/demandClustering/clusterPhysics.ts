import { DemandCluster, ClusterVisibilityState } from '@/types/demand';

/**
 * Thermodynamic equation for the cluster pressure.
 * pressure = Σ(intensity × confidence) × growthVelocity × trustFieldAmplification × proximityCompression
 */
export function computeClusterPhysics(
  cluster: DemandCluster,
  trustFieldAmplification: number = 1.0,
  proximityCompression: number = 1.0
): DemandCluster {
  // Compute raw base from accumulated signals
  const baseIntensity = cluster.totalIntensity;
  const baseConfidence = cluster.totalConfidence;
  
  // Thermodynamic Equation
  const newPressure = (baseIntensity * baseConfidence) 
                    * cluster.velocity 
                    * trustFieldAmplification 
                    * proximityCompression;

  let newState: ClusterVisibilityState = 'invisible';

  if (newPressure > 0.65) {
    newState = 'critical';
  } else if (newPressure > 0.35) {
    newState = 'ghost';
  } else if (newPressure > 0.15) {
    newState = 'emerging';
  }

  // Once collapsed, it stays collapsed
  if (cluster.state === 'collapsed') {
    newState = 'collapsed';
  }

  return {
    ...cluster,
    pressure: newPressure,
    state: newState,
  };
}
