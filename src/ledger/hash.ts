import CryptoJS from 'crypto-js';
import { Observation } from "../types/Observation";
import { canonicalizeObservation } from "./canonicalize";

/**
 * Computes the SHA-256 hash of a deterministic canonicalized representation of the observation.
 */
export function computeHash(obs: Omit<Observation, "hash">): string {
  const canonicalString = canonicalizeObservation(obs);
  return CryptoJS.SHA256(canonicalString).toString(CryptoJS.enc.Hex);
}
