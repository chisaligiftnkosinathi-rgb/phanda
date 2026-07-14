/**
 * Deterministic ID Generator
 *
 * Every engine-generated identifier must be derived from stable inputs,
 * never from wall-clock time or randomness. This ensures:
 *
 *   same inputs → same IDs → same snapshot hashes → replay parity
 *
 * ID Format:
 *   {prefix}_{tickTimestamp}_{sequenceOrContent}
 *
 * Where:
 *   - tickTimestamp is the canonical timestamp injected by the scheduler
 *   - sequenceOrContent is either a counter or a content-derived slug
 *
 * Usage:
 *   const gen = createTickIdGenerator(currentTimestamp);
 *   gen.next('cluster');   // → "cluster_1719532800000_0001"
 *   gen.next('cluster');   // → "cluster_1719532800000_0002"
 *   gen.next('evt');       // → "evt_1719532800000_0003"
 *
 *   gen.fromContent('cluster', 'plumbing', 'pretoria', 'signal_42');
 *   // → "cluster_plumbing_pretoria_signal_42"
 */

/**
 * Sequential ID generator scoped to a single tick.
 * Produces monotonically increasing IDs within one tick execution.
 * Deterministic: same tick timestamp + same call order = same IDs.
 */
export interface TickIdGenerator {
  /** Generate a sequential ID: {prefix}_{tickTimestamp}_{paddedSequence} */
  next(prefix: string): string;

  /** Generate a content-derived ID: {prefix}_{...parts joined by _} */
  fromContent(prefix: string, ...parts: string[]): string;

  /** The canonical tick timestamp this generator is bound to */
  readonly tickTimestamp: number;

  /** Current sequence counter (for debugging/instrumentation) */
  readonly currentSequence: number;
}

export function createTickIdGenerator(tickTimestamp: number): TickIdGenerator {
  let sequence = 0;

  return {
    next(prefix: string): string {
      sequence++;
      return `${prefix}_${tickTimestamp}_${String(sequence).padStart(4, '0')}`;
    },

    fromContent(prefix: string, ...parts: string[]): string {
      // Sanitize parts: lowercase, replace spaces with hyphens, remove non-alphanumeric
      const sanitized = parts.map(p =>
        p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '')
      );
      return `${prefix}_${sanitized.join('_')}`;
    },

    get tickTimestamp() {
      return tickTimestamp;
    },

    get currentSequence() {
      return sequence;
    },
  };
}

/**
 * Convert a tick timestamp to an ISO string deterministically.
 * This is the ONLY allowed way to get an ISO timestamp inside the engine.
 * No `new Date()` without arguments is ever permitted.
 */
export function toISOFromTick(tickTimestamp: number): string {
  return new Date(tickTimestamp).toISOString();
}
