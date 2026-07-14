import { Observation } from "../types/Observation";
import { computeHash } from "./hash";

/**
 * Chaining Engine
 * Computes the correct `previousHash` and `hash` for a new payload to append it to the ledger.
 */
export function chainObservation(
  payload: Omit<Observation, "hash" | "previousHash" | "schemaVersion">,
  lastObservation: Observation | null
): Observation {
  
  const previousHash = lastObservation ? lastObservation.hash : null;
  
  const unhashed: Omit<Observation, "hash"> = {
    ...payload,
    schemaVersion: 1,
    previousHash
  };

  const hash = computeHash(unhashed);

  return {
    ...unhashed,
    hash
  };
}
