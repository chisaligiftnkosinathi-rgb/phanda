export type EconomicEvent =
  | "TICK_START"
  | "SNAPSHOT_CREATED"
  | "DEMAND_UPDATED"
  | "SUPPLY_UPDATED"
  | "CLUSTER_FORMED"
  | "CLUSTER_COLLAPSED"
  | "PHASE_TRANSITION"
  | "OPPORTUNITY_EMITTED"
  | "TRUST_EDGE_CREATED"
  | "BACKPRESSURE_APPLIED";

export interface LedgerEntry {
  id: string;
  type: EconomicEvent;
  timestamp: number;
  payload: any;

  // CRITICAL FOR REPLAY
  snapshotHash: string;
  kernelTickId: string;
}

// Global append-only log for the prototype
export const globalLedger: LedgerEntry[] = [];

export function appendToLedger(entry: LedgerEntry) {
  // In a real system, this writes to an immutable event store (e.g., Kafka, EventDB)
  globalLedger.push(Object.freeze({ ...entry }));
}
