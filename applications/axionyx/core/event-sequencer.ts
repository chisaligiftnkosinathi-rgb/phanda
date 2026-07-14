import { AuditLogEntry, IdentitySnapshot, TrustEvidence, Sequence, ContextFrame } from './types';
import { reconstructTrace } from './trace-reconstructor';
import { buildContextFrame } from './context-frame-builder';

export type EventGraph = {
  sequence: Sequence;
  contextFrames: Map<string, ContextFrame>;
};

/**
 * Coordinates the reconstruction of Facts and the derivation of historical Context Frames
 * into a single unified chronological graph.
 * 
 * @param traceId The unique trace to reconstruct
 * @param auditLog The raw unordered facts
 * @param identityGraph The historical identity snapshot
 * @param trustEvidence Optional trust claims
 * @returns An EventGraph containing the strict Sequence and all Context Frames indexed by eventId
 */
export function buildEventSequence(
  traceId: string,
  auditLog: AuditLogEntry[],
  identityGraph: IdentitySnapshot,
  trustEvidence: TrustEvidence[] = []
): EventGraph {
  
  // 1. Rebuild chronological facts
  const sequence = reconstructTrace(traceId, auditLog);

  // 2. Resolve historical context for every fact
  const contextFrames = new Map<string, ContextFrame>();
  
  for (const fact of sequence.nodes) {
    const frame = buildContextFrame(fact, identityGraph, trustEvidence);
    contextFrames.set(fact.eventId, frame);
  }

  return {
    sequence,
    contextFrames
  };
}
