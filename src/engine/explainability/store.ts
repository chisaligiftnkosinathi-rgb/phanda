import { Explained, DecisionRecord } from './types';

// Global synchronous in-memory store for explanations and decisions
export const globalExplanationStore = new Map<string, Explained<any>>();
export const globalDecisionStore: DecisionRecord[] = [];

/**
 * Stores an Explained result deterministically during the kernel tick.
 * Returns the generated explanationId to be attached to Ledger Entries.
 */
export function storeExplanation<T>(
  tickId: string, 
  subjectId: string, 
  explained: Explained<T>
): string {
  const explanationId = `expl_${tickId}_${subjectId}`;
  
  // Clone to freeze the explanation state at the exact moment of execution
  globalExplanationStore.set(explanationId, JSON.parse(JSON.stringify(explained)));
  
  return explanationId;
}

export function recordDecision(decision: DecisionRecord) {
  globalDecisionStore.push(Object.freeze({ ...decision }));
}
