export type ExplanationSource = 
  | "TRUST" 
  | "SUPPLY" 
  | "DEMAND" 
  | "FORECAST" 
  | "POLICY" 
  | "REPLAY"
  | "KERNEL";

export interface ExplanationNode {
  id: string;
  title: string;
  value: number | string;
  source: ExplanationSource;
  weight: number;
  confidence: number;
  children: ExplanationNode[];
}

export interface Explained<T> {
  value: T;
  explanation: ExplanationNode[];
  metrics: Record<string, number>;
}

export type DecisionOutcome = "ALLOWED" | "DEFERRED" | "REJECTED" | "EXECUTED";

export interface DecisionRecord {
  id: string;
  tickId: string;
  decisionType: "MATCH" | "PHASE_TRANSITION" | "POLICY" | "COMMIT" | "FORECAST";
  subjectId: string;
  outcome: DecisionOutcome;
  explanationId: string;
  timestamp: number;
}
