export type UIGovernanceIntentType = 
  | "ethical_boundary" 
  | "operational_goal" 
  | "safety_constraint" 
  | "philosophical_principle";

export type UIGovernanceScope = "WorldA" | "WorldB" | "WorldC" | "WorldD" | "global";

export interface UIGovernanceIntent {
  id: string;
  intentStatement: string;
  intentType: UIGovernanceIntentType;
  priorityLevel: "soft" | "medium" | "hard";
  scope: UIGovernanceScope;
  active: boolean;
}

export type UIEnforcementMode = "advisory" | "blocking" | "hard_reject";

export interface UIGovernanceRuleBinding {
  intentId: string;
  boundLayer: "A+" | "A" | "B" | "C" | "D";
  constraintExpression: string; // Machine-readable
  enforcementMode: UIEnforcementMode;
  lastValidatedAt: string;
}

export type UIGovernanceConflictType = 
  | "intent_violation" 
  | "overreach_risk" 
  | "semantic_misalignment";

export interface UIGovernanceConflict {
  id: string;
  conflictType: UIGovernanceConflictType;
  severity: number; // 0-1
  affectedLayer: string;
  explanationTrace: string;
  timestamp: string;
}

export interface UIGovernanceHealthState {
  status: "aligned" | "drifting" | "critical_misalignment";
  driftScore: number;
  activeConflictsCount: number;
  lastEvaluationTimestamp: string;
}
