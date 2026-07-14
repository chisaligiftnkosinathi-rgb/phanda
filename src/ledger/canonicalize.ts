import { Observation } from "../types/Observation";

/**
 * Produces a deterministic string representation of an observation for hashing.
 * Crucially omits the `hash` field itself.
 */
export function canonicalizeObservation(obs: Omit<Observation, "hash">): string {
  // We sort object keys (like metadata) to ensure strict determinism
  const metadataString = obs.metadata ? stringifyDeterministic(obs.metadata) : "null";
  
  return [
    obs.schemaVersion,
    obs.id,
    obs.occurredAt,
    obs.capturedAt,
    obs.type,
    obs.content,
    metadataString,
    obs.previousHash === null ? "ROOT" : obs.previousHash
  ].join("||");
}

function stringifyDeterministic(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stringifyDeterministic).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const serialized = keys.map(k => `${k}:${stringifyDeterministic(obj[k])}`).join(',');
  return `{${serialized}}`;
}
