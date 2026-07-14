import { DemandCluster } from '@/types/demand';

export type ClusterInteraction = "MERGE" | "COMPETE" | "IGNORE";

/**
 * Determines how two clusters interact based on semantic similarity and capacity conflict.
 */
export function detectCollision(clusterA: DemandCluster, clusterB: DemandCluster): ClusterInteraction {
  // Mock spatial check (requires actual geospatial indexing in prod)
  if (clusterA.centroid.label !== clusterB.centroid.label) {
    return "IGNORE";
  }

  // 1. Semantic Similarity (Merge Condition)
  // For the prototype, we use exact string matches.
  // In production, this would use embeddings (e.g. similarity > 0.75).
  if (clusterA.category.toLowerCase() === clusterB.category.toLowerCase()) {
    return "MERGE";
  }

  // 2. Capacity Conflict (Compete Condition)
  // If they don't merge, but share the same geographic pool of trusted labor, they COMPETE.
  return "COMPETE";
}
