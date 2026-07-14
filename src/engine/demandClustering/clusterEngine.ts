import { toISOFromTick } from '@/engine/kernel/deterministicId';
import { DemandCluster, DemandSignal } from '@/types/demand';

const DISTANCE_THRESHOLD = 5.0;
const TIME_WINDOW_MS = 1000 * 60 * 60 * 24;

/**
 * Simple mock distance function since we only have labels, not coordinates.
 * Replace with real geospatial logic later (Haversine).
 */
function mockDistance(labelA?: string, labelB?: string): number {
  if (!labelA || !labelB) return 10;
  if (labelA === labelB) return 0;
  return 10;
}

/**
 * Clustering Engine
 * Deterministically merges signals into clusters based on category,
 * proximity, and time window overlap.
 */
export function clusterSignals(
  activeSignals: DemandSignal[],
  existingClusters: DemandCluster[],
  currentTimestamp: number
): DemandCluster[] {
  const updatedClusters = [...existingClusters];
  const nowISO = toISOFromTick(currentTimestamp);

  for (const signal of activeSignals) {
    if (signal.status === 'collapsed') continue;

    const signalTime = signal.lastUpdated
      ? Date.parse(signal.lastUpdated)
      : 0;

    const clusterIndex = updatedClusters.findIndex((c) => {
      const isSameCategory = c.category === signal.category;

      const isClose =
        mockDistance(c.centroid?.label, signal.location?.label) <=
        DISTANCE_THRESHOLD;

      const clusterTime = c.lastUpdated
        ? Date.parse(c.lastUpdated)
        : 0;

      const isWithinWindow =
        Math.abs(signalTime - clusterTime) < TIME_WINDOW_MS;

      return (
        isSameCategory &&
        isClose &&
        isWithinWindow &&
        c.state !== 'collapsed'
      );
    });

    if (clusterIndex >= 0) {
      const cluster = updatedClusters[clusterIndex];

      if (!cluster.signals.includes(signal.id)) {
        cluster.signals.push(signal.id);
        cluster.totalIntensity += signal.intensity;
        cluster.totalConfidence += signal.confidence;
        cluster.lastUpdated = nowISO;
      }
    } else {
      const safeLabel =
        signal.location?.label
          ?.toLowerCase()
          .replace(/\s+/g, '-') ?? 'unknown';

      const clusterId =
        `cluster_${signal.category}_${safeLabel}_${signal.id}`;

      updatedClusters.push({
        id: clusterId,
        category: signal.category,
        signals: [signal.id],
        centroid: { label: signal.location?.label },
        totalIntensity: signal.intensity,
        totalConfidence: signal.confidence,
        velocity: 0.05,
        pressure: 0,
        state: 'invisible',
        lastUpdated: nowISO,
        suppressionFactor: 0,
        priorityScore: 0,
      });
    }
  }

  return updatedClusters;
}
