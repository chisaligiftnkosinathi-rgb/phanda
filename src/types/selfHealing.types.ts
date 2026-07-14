export type UIMemoryConflictType =
  | "semantic_mismatch"     // Meaning vs Execution mismatch
  | "temporal_drift"        // same entity, different states over time
  | "causal_break"          // graph edges disagree
  | "scripture_tension";    // canonical truth vs observed behavior

export interface UIMemoryConflict {
  id: string;
  conflictType: UIMemoryConflictType;
  sourceA: string; // ID of the first node (e.g. Work or Lead)
  sourceB: string; // ID of the second node (e.g. Reflection or Scripture)
  severityScore: number; // 0-1
  firstObservedAt: string;
  frequencyCount: number;
}

export type UIHealingStrategyType =
  | "annotate_only"
  | "dual_truth_mode"
  | "confidence_split"
  | "lineage_reweight";

export interface UIHealingSuggestion {
  id: string;
  conflictId: string;
  strategyType: UIHealingStrategyType;
  explanation: string;
  confidence: number;
  impactScope: "A" | "B" | "C" | "C+" | "cross-layer";
}

export interface UIMemoryStateSnapshot {
  snapshotId: string;
  timestamp: string;
  hashA: string;
  hashB: string;
  hashC: string;
  hashCPlus: string;
}

export type UISystemHealthStatus =
  | "healthy"
  | "unstable_meaning"
  | "execution_meaning_divergence"
  | "canonical_tension_high"
  | "graph_fragmentation_detected";
