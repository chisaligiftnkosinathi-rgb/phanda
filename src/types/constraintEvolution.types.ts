export type UIConstraintChangeType = "add_rule" | "remove_rule" | "relax_rule" | "tighten_rule";
export type UIConstraintRationaleType = "conflict_frequency" | "performance_pressure" | "system_stability_adjustment";

export interface UIConstraintImpactSimulation {
  proposalId: string;
  affectedEntities: string[];
  predictedViolationsDelta: number;
  stabilityDelta: number;
  contradictionRiskIncrease: number;
}

export interface UIConstraintProposal {
  id: string;
  targetConstraintId: string;
  proposedChange: UIConstraintChangeType;
  rationaleType: UIConstraintRationaleType;
  riskScore: number; // 0-1
  simulationOutcome: UIConstraintImpactSimulation;
  createdFrom: string[]; // C++, C+, A+ logs
}

export interface UIConstraintVersion {
  versionId: string;
  timestamp: string;
  activeConstraints: string[];
  deprecatedConstraints: string[];
  deltaFromPrevious: string;
}
