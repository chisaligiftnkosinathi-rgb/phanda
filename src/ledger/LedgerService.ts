import { StorageAdapter } from "../storage/StorageAdapter";
import { Observation } from "../types/Observation";
import { chainObservation } from "./chain";
import { LedgerValidationResult } from "./errors";

export class LedgerService {
  constructor(private storage: StorageAdapter) {}

  /**
   * Safely captures and securely hashes an observation before appending to the ledger.
   * This is the ONLY way an observation should be written.
   */
  async capture(payload: Omit<Observation, "hash" | "previousHash" | "schemaVersion">): Promise<boolean> {
    try {
      // 1. Get the current timeline to find the last valid hash
      const timelineResult = await this.storage.loadTimeline();
      if (!timelineResult.success) return false;
      
      const timeline = timelineResult.data;
      const lastObs = timeline.length > 0 ? timeline[timeline.length - 1] : null;

      // 2. Cryptographically chain the new observation
      const chainedObservation = chainObservation(payload, lastObs);

      // 3. Append via the dumb storage layer
      const saveResult = await this.storage.saveObservation(chainedObservation);
      return saveResult.success;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieves the full timeline of observations in chronological order.
   */
  async getTimeline(): Promise<Observation[]> {
    const result = await this.storage.loadTimeline();
    if (!result.success) return [];
    return result.data;
  }

  /**
   * Triggers a full integrity validation pipeline on the stored ledger.
   */
  async validate(): Promise<LedgerValidationResult> {
    const result = await this.storage.validateLedger();
    if (result.success) {
      return result.data;
    }
    
    return {
      valid: false,
      errors: [{ index: 0, observationId: "UNKNOWN", reason: "CORRUPTED_PAYLOAD" }],
      observationCount: 0
    };
  }
}
