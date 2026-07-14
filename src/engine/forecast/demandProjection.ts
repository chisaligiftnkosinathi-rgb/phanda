import { DemandCluster } from '@/types/demand';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Simulates forward demand evolution.
 * Unresolved clusters "heat up" in pressure as urgency increases, 
 * simulating growing consumer pressure.
 */
export function projectDemandTick(cluster: DemandCluster, tickIndex: number): DemandCluster {
  // If a cluster is not yet collapsed, its pressure grows slightly over time
  if (cluster.state === 'collapsed') return cluster;

  // Assume velocity adds compounding pressure over future ticks
  const heatIncrease = cluster.velocity * 0.05 * (tickIndex + 1);
  const projectedPressure = clamp(cluster.pressure + heatIncrease, 0, 1);

  return {
    ...cluster,
    pressure: projectedPressure
  };
}
