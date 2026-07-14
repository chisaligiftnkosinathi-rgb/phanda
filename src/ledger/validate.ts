import { Observation } from "../types/Observation";
import { LedgerValidationResult, LedgerError } from "./errors";
import { computeHash } from "./hash";

/**
 * Validates the chronological, schema, and cryptographic integrity of a ledger chain.
 */
export function validateLedgerPipeline(timeline: Observation[]): LedgerValidationResult {
  const errors: LedgerError[] = [];
  let firstInvalidIndex: number | undefined = undefined;

  let expectedPreviousHash: string | null = null;
  let lastTimestamp = 0;

  for (let i = 0; i < timeline.length; i++) {
    const obs = timeline[i];

    // 1. Schema Valid
    if (obs.schemaVersion !== 1 || !obs.id || !obs.occurredAt || !obs.hash) {
      recordError(i, obs.id, "SCHEMA_INVALID");
      continue;
    }

    // 2. Chronology Valid
    const currentTimestamp = new Date(obs.occurredAt).getTime();
    if (currentTimestamp < lastTimestamp) {
      recordError(i, obs.id, "CHRONOLOGY_VIOLATION");
      continue;
    }
    lastTimestamp = currentTimestamp;

    // 3. Chain Link Valid
    if (obs.previousHash !== expectedPreviousHash) {
      recordError(i, obs.id, "CHAIN_BROKEN");
      continue;
    }

    // 4. Payload Hash Valid
    const { hash, ...unhashed } = obs;
    const computedHash = computeHash(unhashed);
    if (computedHash !== hash) {
      recordError(i, obs.id, "HASH_MISMATCH");
      continue;
    }

    // If perfectly valid, advance the expected hash for the next link
    expectedPreviousHash = obs.hash;
  }

  function recordError(index: number, id: string, reason: LedgerError["reason"]) {
    errors.push({ index, observationId: id, reason });
    if (firstInvalidIndex === undefined) {
      firstInvalidIndex = index;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    firstInvalidIndex,
    observationCount: timeline.length
  };
}
