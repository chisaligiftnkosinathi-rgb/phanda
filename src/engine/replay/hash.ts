import { SystemSnapshot } from '../kernel/snapshot';

/**
 * Deterministically stringifies an object by sorting its keys.
 * This ensures that {a:1, b:2} and {b:2, a:1} hash to the identical string.
 */
function deterministicStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  
  if (Array.isArray(obj)) {
    return `[${obj.map(deterministicStringify).join(',')}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => `"${key}":${deterministicStringify(obj[key])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Fast FNV-1a 32-bit Hash implementation.
 * Used for high-frequency deterministic snapshot identity.
 * Not for cryptographic security, solely for reconstruction integrity.
 */
function fnv1a32(str: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime
  }
  return hash.toString(16);
}

/**
 * Hashes a SystemSnapshot deterministically.
 */
export function hashSnapshot(snapshot: SystemSnapshot): string {
  const normalizedStr = deterministicStringify(snapshot);
  return fnv1a32(normalizedStr);
}
