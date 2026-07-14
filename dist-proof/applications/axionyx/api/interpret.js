"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeTrace = analyzeTrace;
const evidence_validator_1 = require("../core/evidence-validator");
const knowledge_resolver_1 = require("../core/knowledge-resolver");
const event_sequencer_1 = require("../core/event-sequencer");
const rule_evaluator_1 = require("../core/rule-evaluator");
const anomaly_detector_1 = require("../core/anomaly-detector");
function analyzeTrace(request) {
    // 0. Validate Evidence Schema
    const validationErrors = (0, evidence_validator_1.validateEvidence)(request);
    if (validationErrors.length > 0) {
        return {
            status: "INVALID_EVIDENCE",
            errors: validationErrors
        };
    }
    const { traceId, dataSource } = request;
    // 1. Load Knowledge
    // In a real execution environment, we might dynamically locate the Knowledge Set 
    // based on the trace's `sourceLayer` or `domain`. For Proof 002, we hardcode to v1.
    const path = require('path');
    const knowledgeSet = (0, knowledge_resolver_1.loadKnowledgeSet)(path.join(__dirname, '../governance-v1.json'));
    // 2. Reconstruct Time and Context (The Evidence base)
    const eventGraph = (0, event_sequencer_1.buildEventSequence)(traceId, dataSource.auditLog, dataSource.identityGraph, dataSource.trustEvidence);
    const proof = [];
    const allAnomalies = [];
    // Metrics accumulators
    let evidencePassed = 0;
    let evidenceTotal = 0;
    let governancePassed = 0;
    let governanceTotal = 0;
    let consistencyPassed = 0;
    let consistencyTotal = 0;
    // 3. Evaluate Rule for Each Fact (The Epistemic Engine)
    for (const fact of eventGraph.sequence.nodes) {
        const contextFrame = eventGraph.contextFrames.get(fact.eventId);
        // Execute causal evaluation
        const evaluation = (0, rule_evaluator_1.evaluateRuleForFact)(fact, contextFrame, eventGraph.sequence, knowledgeSet);
        if (evaluation) {
            proof.push(evaluation);
            // Track metric tallies
            for (const assertion of evaluation.assertions) {
                const def = knowledgeSet.assertionLibrary.find(a => a.type === assertion.assertionType);
                if (!def)
                    continue;
                if (def.family === "EVIDENCE") {
                    evidenceTotal++;
                    if (assertion.outcome === "PASS")
                        evidencePassed++;
                }
                else if (def.family === "GOVERNANCE") {
                    governanceTotal++;
                    if (assertion.outcome === "PASS")
                        governancePassed++;
                }
                else if (def.family === "CONSISTENCY") {
                    consistencyTotal++;
                    if (assertion.outcome === "PASS")
                        consistencyPassed++;
                }
            }
            // 4. Derive Anomalies
            const anomalies = (0, anomaly_detector_1.detectAnomalies)(evaluation, knowledgeSet);
            allAnomalies.push(...anomalies);
        }
    }
    // 5. Compute Final Interpretation
    const evidenceCompleteness = evidenceTotal > 0 ? (evidencePassed / evidenceTotal) * 100 : 100;
    const governanceCompliance = governanceTotal > 0 ? (governancePassed / governanceTotal) * 100 : 100;
    const logicalConsistency = consistencyTotal > 0 ? (consistencyPassed / consistencyTotal) * 100 : 100;
    const verdict = (evidenceCompleteness === 100 &&
        governanceCompliance === 100 &&
        logicalConsistency === 100) ? "COHERENT" : "COMPROMISED";
    const interpretation = {
        verdict,
        metrics: {
            evidenceCompleteness,
            governanceCompliance,
            logicalConsistency,
            determinismScore: 100 // Verified externally by the execution harness
        },
        supportingProof: proof,
        anomalies: allAnomalies
    };
    return {
        status: "SUCCESS",
        data: {
            traceId,
            interpretation,
            sequence: eventGraph.sequence,
            contextFrames: Array.from(eventGraph.contextFrames.values())
        }
    };
}
