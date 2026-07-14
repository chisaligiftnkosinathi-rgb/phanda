import { Observation } from "../types/Observation";
import { StorageResult } from "../types/StorageResult";

import { LedgerValidationResult } from "../ledger/errors";

export interface StorageAdapter {
  /**
   * Appends an observation to the ledger.
   * If an observation with the same ID exists, it acts idempotently.
   * If the ID exists but the content is mutated, it rejects (Immutability).
   */
  saveObservation(observation: Observation): Promise<StorageResult<void>>;

  /**
   * Retrieves all observations in strictly ascending chronological order.
   */
  loadTimeline(): Promise<StorageResult<Observation[]>>;

  /**
   * Scans the ledger for corruption, sequence drift, or malformed entries.
   */
  validateLedger(): Promise<StorageResult<LedgerValidationResult>>;

  /**
   * Generates a portable backup of the entire ledger.
   */
  backup(): Promise<StorageResult<string>>;

  /**
   * Completely replaces the current ledger with the provided backup.
   */
  restore(source: string): Promise<StorageResult<void>>;
}
