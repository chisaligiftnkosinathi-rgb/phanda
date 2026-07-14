export interface UIHumanDecisionOption {
  id: string;
  label: string; // e.g., "accept A+ block", "apply D proposal A", "ignore E drift warning", "continue with dual truth mode"
  sourceLayer: "A+" | "D" | "E" | "C++";
  consequenceTrace: string;
}

export interface UIHumanOverrideRequest {
  id: string;
  timestamp: string;
  haltReason: string;
  frozenState: {
    aPlusRejection?: string;
    cPlusPlusConflicts?: string[];
    dProposals?: string[];
    eDriftFlags?: string[];
  };
  options: UIHumanDecisionOption[];
}

export interface UIHumanOverrideDecision {
  requestId: string;
  selectedOptionId: string;
  actor: string;
  timestamp: string;
}
