"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconstructTrace = reconstructTrace;
/**
 * Reconstructs a strict chronological Sequence from an unordered set of AuditLog entries.
 * Pure function: Deterministic, no side effects, no database lookups.
 *
 * @param traceId The unique trace identifier
 * @param auditLog The raw unordered immutable facts
 * @returns A strictly ordered Sequence of Facts
 */
function reconstructTrace(traceId, auditLog) {
    // 1. Filter facts that belong exactly to this trace
    const traceFacts = auditLog.filter(entry => entry.traceId === traceId);
    // 2. Sort chronologically to rebuild the arrow of time
    // If timestamps are exactly identical, fallback to stable sort on eventId
    const sortedNodes = [...traceFacts].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (timeA === timeB) {
            return a.eventId.localeCompare(b.eventId);
        }
        return timeA - timeB;
    });
    return {
        traceId,
        nodes: sortedNodes
    };
}
