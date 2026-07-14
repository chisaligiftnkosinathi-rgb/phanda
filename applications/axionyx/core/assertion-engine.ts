import { Fact, ContextFrame, Sequence, AssertionConfig, AssertionResult, AssertionDefinition, KnowledgeSet } from './types';

type AssertionContext = {
  fact: Fact;
  contextFrame: ContextFrame;
  sequence: Sequence;
  knowledgeSet: KnowledgeSet;
};

type EvaluatorFn = (ctx: AssertionContext, params?: Record<string, any>) => "PASS" | "FAIL" | "UNKNOWN";

const EvaluatorRegistry: Record<string, EvaluatorFn> = {
  
  "actor-exists": (ctx) => {
    // Requires Context Frame resolution
    if (ctx.contextFrame.resolutionStatus === "ACTOR_NOT_FOUND") return "UNKNOWN";
    if (ctx.contextFrame.resolutionStatus === "INSUFFICIENT_HISTORY") return "UNKNOWN";
    if (ctx.contextFrame.resolutionStatus === "RESOLVED") return "PASS";
    return "UNKNOWN";
  },
  
  "trace-exists": (ctx) => {
    return ctx.sequence.nodes.length > 0 ? "PASS" : "FAIL";
  },
  
  "context-frame-resolved": (ctx) => {
    return ctx.contextFrame.resolutionStatus === "RESOLVED" ? "PASS" : "UNKNOWN";
  },
  
  "required-antecedent": (ctx, params) => {
    if (!params || !params.action) return "UNKNOWN";
    
    // Check if the required antecedent occurred BEFORE the current fact in the sequence
    const currentIndex = ctx.sequence.nodes.findIndex(n => n.eventId === ctx.fact.eventId);
    if (currentIndex <= 0) return "FAIL"; // Cannot have an antecedent if it's the first node
    
    // Look backwards for the required action
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (ctx.sequence.nodes[i].action === params.action) {
        return "PASS";
      }
    }
    
    return "FAIL";
  },
  
  "actor-has-permission": (ctx, params) => {
    if (!params || !params.action || !params.resource) return "UNKNOWN";
    
    if (ctx.contextFrame.resolutionStatus !== "RESOLVED") return "UNKNOWN";
    
    const hasPerm = ctx.contextFrame.activePermissions.some(
      p => p.action === params.action && p.resource === params.resource
    );
    
    return hasPerm ? "PASS" : "FAIL";
  },
  
  "chronology-valid": (ctx) => {
    // Check if any timestamps in the sequence violate strict monotonicity up to this fact
    let lastTime = 0;
    for (const node of ctx.sequence.nodes) {
      const time = new Date(node.timestamp).getTime();
      if (time < lastTime) return "FAIL";
      lastTime = time;
      
      if (node.eventId === ctx.fact.eventId) break; // Only check up to current fact
    }
    return "PASS";
  },
  
  "no-duplicate-facts": (ctx) => {
    // Check if this fact appears more than once in the sequence
    const occurrences = ctx.sequence.nodes.filter(
      n => n.action === ctx.fact.action && n.targetResource === ctx.fact.targetResource && n.actorId === ctx.fact.actorId
    );
    return occurrences.length > 1 ? "FAIL" : "PASS";
  }
};

/**
 * Executes a single assertion against the provided Evidence context.
 */
export function evaluateAssertion(
  assertionConfig: AssertionConfig,
  ctx: AssertionContext
): AssertionResult {
  
  // Find the assertion definition in the library
  const definition = ctx.knowledgeSet.assertionLibrary.find(a => a.assertionId === assertionConfig.assertionId);
  
  if (!definition) {
    return {
      assertionType: "UNKNOWN_ASSERTION",
      outcome: "UNKNOWN",
      context: `Assertion library missing definition for ID: ${assertionConfig.assertionId}`
    };
  }
  
  const evaluatorFn = EvaluatorRegistry[definition.evaluator];
  
  if (!evaluatorFn) {
    return {
      assertionType: definition.type,
      outcome: "UNKNOWN",
      context: `Assertion Engine missing evaluator implementation for: ${definition.evaluator}`
    };
  }

  // Execute the pure function evaluator
  const outcome = evaluatorFn(ctx, assertionConfig.params);
  
  return {
    assertionType: definition.type,
    outcome
  };
}
