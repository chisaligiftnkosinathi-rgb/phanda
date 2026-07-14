export type UIExecutionEntityType = "Work" | "Lead" | "Invoice" | "Payment" | "Quote";

export interface UIExecutionConstraint {
  id: string;
  entityType: UIExecutionEntityType;
  allowedTransitions: Record<string, string[]>;
  invariantRules: string[];
  severity: "warning" | "hard_block";
  source: "system" | "config" | "derived_policy";
}

export type UIExecutionViolationReason = 
  | "invalid_state_jump"
  | "missing_dependency"
  | "financial_inconsistency"
  | "lifecycle_break";

export interface UIExecutionViolation {
  id: string;
  entityType: UIExecutionEntityType;
  attemptedTransition: string;
  reasonCode: UIExecutionViolationReason;
  blocked: boolean;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface UIExecutionStateSnapshot {
  entityId: string;
  entityType: UIExecutionEntityType;
  hash: string;
  dependencies: string[];
  lastValidTransition: string;
  constraintVersion: string;
}
