"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAnomalies = detectAnomalies;
/**
 * Derives anomalies exclusively from failed or unknown assertion outcomes.
 * No business logic exists here; it simply maps rule violations to structured Anomaly formats
 * for human and downstream explainability.
 */
function detectAnomalies(evaluation, knowledgeSet) {
    const anomalies = [];
    for (const result of evaluation.assertions) {
        if (result.outcome === "PASS")
            continue;
        const definition = knowledgeSet.assertionLibrary.find(a => a.type === result.assertionType);
        if (!definition)
            continue;
        // EVIDENCE anomalies (UNKNOWN assertions)
        if (result.outcome === "UNKNOWN") {
            if (definition.type === "ActorExists") {
                anomalies.push({
                    family: "EVIDENCE",
                    type: "ACTOR_NOT_FOUND",
                    eventId: evaluation.factId,
                    description: "The actor associated with this fact could not be resolved in the historical identity graph."
                });
            }
            else if (definition.type === "ContextFrameResolved") {
                anomalies.push({
                    family: "EVIDENCE",
                    type: "INSUFFICIENT_HISTORY",
                    eventId: evaluation.factId,
                    description: "Missing historical evidence (e.g. roles) prevented resolution of the context frame."
                });
            }
            else if (definition.type === "TraceExists") {
                anomalies.push({
                    family: "EVIDENCE",
                    type: "ORPHANED_TRACE",
                    eventId: evaluation.factId,
                    description: "The trace sequence is missing expected structural boundaries."
                });
            }
            // Catch-all for other missing evidence
            else {
                anomalies.push({
                    family: "EVIDENCE",
                    type: "INSUFFICIENT_HISTORY",
                    eventId: evaluation.factId,
                    description: `Historical evidence insufficient to evaluate ${definition.type}.`
                });
            }
        }
        // GOVERNANCE anomalies (FAIL assertions in governance)
        if (result.outcome === "FAIL" && definition.family === "GOVERNANCE") {
            if (definition.type === "RequiredAntecedent") {
                anomalies.push({
                    family: "GOVERNANCE",
                    type: "MISSING_ANTECEDENT",
                    eventId: evaluation.factId,
                    description: "An action was taken without its required preceding state or action being present in the trace."
                });
            }
            else if (definition.type === "ActorHasPermission") {
                anomalies.push({
                    family: "GOVERNANCE",
                    type: "PRIVILEGE_GAP",
                    eventId: evaluation.factId,
                    description: "The actor executed an action without holding the historically required permission."
                });
            }
        }
        // CONSISTENCY anomalies (FAIL assertions in consistency)
        if (result.outcome === "FAIL" && definition.family === "CONSISTENCY") {
            if (definition.type === "ChronologyValid") {
                anomalies.push({
                    family: "CONSISTENCY",
                    type: "TEMPORAL_VIOLATION",
                    eventId: evaluation.factId,
                    description: "Events within the trace violate strict chronological ordering."
                });
            }
            else if (definition.type === "NoDuplicateFacts") {
                anomalies.push({
                    family: "CONSISTENCY",
                    type: "DUPLICATE_FACT",
                    eventId: evaluation.factId,
                    description: "An identical action occurred multiple times under the same trace, actor, and target."
                });
            }
        }
    }
    return anomalies;
}
