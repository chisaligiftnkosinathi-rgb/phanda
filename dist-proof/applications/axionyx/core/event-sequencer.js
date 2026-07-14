"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEventSequence = buildEventSequence;
const trace_reconstructor_1 = require("./trace-reconstructor");
const context_frame_builder_1 = require("./context-frame-builder");
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
function buildEventSequence(traceId, auditLog, identityGraph, trustEvidence = []) {
    // 1. Rebuild chronological facts
    const sequence = (0, trace_reconstructor_1.reconstructTrace)(traceId, auditLog);
    // 2. Resolve historical context for every fact
    const contextFrames = new Map();
    for (const fact of sequence.nodes) {
        const frame = (0, context_frame_builder_1.buildContextFrame)(fact, identityGraph, trustEvidence);
        contextFrames.set(fact.eventId, frame);
    }
    return {
        sequence,
        contextFrames
    };
}
