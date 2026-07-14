export interface LedgerError {
  index: number;
  observationId: string;
  reason: "HASH_MISMATCH" | "CHAIN_BROKEN" | "CORRUPTED_PAYLOAD" | "CHRONOLOGY_VIOLATION" | "SCHEMA_INVALID";
}

export interface LedgerValidationResult {
  valid: boolean;
  errors: LedgerError[];
  firstInvalidIndex?: number;
  observationCount: number;
}
