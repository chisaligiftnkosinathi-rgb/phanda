export type PhaseState = 
  | "POTENTIAL"
  | "ALIGNING"
  | "COMMITTING"
  | "LOCKED"
  | "FAILED";

export interface PhaseEvent {
  id: string;
  clusterId: string;
  supplySignalId: string;

  state: PhaseState;

  tension: number;        // bounded [-1, 1]
  trustAlignment: number; // 0-1 normalized
  decayRisk: number;      // 0-1 probability
  
  alignment: number;      // Persisted for auditability
  timestamp: string;
}
