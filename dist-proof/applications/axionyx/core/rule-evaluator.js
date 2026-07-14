"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateRuleForFact = evaluateRuleForFact;
const assertion_engine_1 = require("./assertion-engine");
/**
 * Evaluates a specific Fact against the full KnowledgeSet to find the governing rule
 * and aggregate its assertions into a Proof (RuleEvaluationResult).
 */
function evaluateRuleForFact(fact, contextFrame, sequence, knowledgeSet) {
    // 1. Find the rule that governs this action
    const rule = knowledgeSet.ruleSet.find(r => r.action === fact.action);
    if (!rule) {
        // If there is no rule governing this action, we return null to indicate
        // it's an ungoverned action (which might be an anomaly depending on strict mode).
        return null;
    }
    const assertionResults = [];
    let outcome = "PASS"; // Assume PASS until proven otherwise
    const ctx = { fact, contextFrame, sequence, knowledgeSet };
    // 2. Evaluate all assertions composed into this rule
    for (const assertionConfig of rule.assertions) {
        const result = (0, assertion_engine_1.evaluateAssertion)(assertionConfig, ctx);
        assertionResults.push(result);
        // Aggregate the outcome
        if (result.outcome === "FAIL") {
            outcome = "FAIL";
        }
        else if (result.outcome === "UNKNOWN" && outcome !== "FAIL") {
            outcome = "INDETERMINATE";
        }
    }
    // 3. Return the evaluated proof
    return {
        ruleId: rule.ruleId,
        factId: fact.eventId,
        outcome,
        assertions: assertionResults
    };
}
