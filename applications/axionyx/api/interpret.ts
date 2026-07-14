import { AnalyzeTraceRequest, AnalyzeTraceResult, AnalyzeTraceResponse, Interpretation, RuleEvaluationResult, Anomaly } from '../core/types';
import { validateEvidence } from '../core/evidence-validator';
import { loadKnowledgeSet } from '../core/knowledge-resolver';
import { buildEventSequence } from '../core/event-sequencer';
import { evaluateRuleForFact } from '../core/rule-evaluator';
import { detectAnomalies } from '../core/anomaly-detector';

export function analyzeTrace(request: AnalyzeTraceRequest | any): AnalyzeTraceResponse {
  // 0. Validate Evidence Schema
  const validationErrors = validateEvidence(request);
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
  const knowledgeSet = loadKnowledgeSet(path.join(__dirname, '../governance-v1.json'));

  // 2. Reconstruct Time and Context (The Evidence base)
  const eventGraph = buildEventSequence(
    traceId, 
    dataSource.auditLog, 
    dataSource.identityGraph, 
    dataSource.trustEvidence
  );

  const proof: RuleEvaluationResult[] = [];
  const allAnomalies: Anomaly[] = [];

  // Metrics accumulators
  let evidencePassed = 0;
  let evidenceTotal = 0;
  
  let governancePassed = 0;
  let governanceTotal = 0;

  let consistencyPassed = 0;
  let consistencyTotal = 0;

  // 3. Evaluate Rule for Each Fact (The Epistemic Engine)
  for (const fact of eventGraph.sequence.nodes) {
    const contextFrame = eventGraph.contextFrames.get(fact.eventId)!;

    // Execute causal evaluation
    const evaluation = evaluateRuleForFact(fact, contextFrame, eventGraph.sequence, knowledgeSet);
    
    if (evaluation) {
      proof.push(evaluation);

      // Track metric tallies
      for (const assertion of evaluation.assertions) {
        const def = knowledgeSet.assertionLibrary.find(a => a.type === assertion.assertionType);
        if (!def) continue;

        if (def.family === "EVIDENCE") {
          evidenceTotal++;
          if (assertion.outcome === "PASS") evidencePassed++;
        } else if (def.family === "GOVERNANCE") {
          governanceTotal++;
          if (assertion.outcome === "PASS") governancePassed++;
        } else if (def.family === "CONSISTENCY") {
          consistencyTotal++;
          if (assertion.outcome === "PASS") consistencyPassed++;
        }
      }

      // 4. Derive Anomalies
      const anomalies = detectAnomalies(evaluation, knowledgeSet);
      allAnomalies.push(...anomalies);
    }
  }

  // 5. Compute Final Interpretation
  const evidenceCompleteness = evidenceTotal > 0 ? (evidencePassed / evidenceTotal) * 100 : 100;
  const governanceCompliance = governanceTotal > 0 ? (governancePassed / governanceTotal) * 100 : 100;
  const logicalConsistency = consistencyTotal > 0 ? (consistencyPassed / consistencyTotal) * 100 : 100;

  const verdict = (
    evidenceCompleteness === 100 && 
    governanceCompliance === 100 && 
    logicalConsistency === 100
  ) ? "COHERENT" : "COMPROMISED";

  const interpretation: Interpretation = {
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
