import { globalDecisionStore, globalExplanationStore } from './store';
import { DecisionRecord, Explained, ExplanationNode } from './types';

export interface AuditTrace {
  decision: DecisionRecord;
  explanation: Explained<any> | null;
}

/**
 * Retrieves the full decision record and its associated deterministic explanation tree.
 */
export function explainDecision(decisionId: string): AuditTrace | null {
  const decision = globalDecisionStore.find(d => d.id === decisionId);
  if (!decision) return null;

  const explanation = globalExplanationStore.get(decision.explanationId) || null;

  return {
    decision,
    explanation
  };
}

/**
 * Renders the explanation tree as a structured string for the Operator Dashboard.
 */
export function renderExplanationTree(node: ExplanationNode, indent: number = 0): string {
  const prefix = " ".repeat(indent * 4);
  const connector = indent > 0 ? "├── " : "";
  let result = `${prefix}${connector}${node.title} (${node.value}) [Weight: ${node.weight}, Source: ${node.source}, Conf: ${Math.round(node.confidence * 100)}%]\n`;
  
  if (node.children) {
    for (const child of node.children) {
      result += renderExplanationTree(child, indent + 1);
    }
  }
  
  return result;
}
