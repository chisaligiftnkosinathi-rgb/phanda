export type CGNodeType =
  | "WorkNode"
  | "ReflectionNode"
  | "GivingNode"
  | "CampaignNode"
  | "ScriptureNode"
  | "InsightNode"
  | "InsightSweepNode";

export interface CGNode {
  id: string;
  type: CGNodeType;
  label: string; // concise representation of the node's truth
  timestamp: string;
}

export type CGEdgeType =
  | "generated"         // e.g., Work -> Reflection
  | "influenced"        // e.g., Scripture -> Insight
  | "derived_from"      // e.g., Reflection -> Insight
  | "summarized_from"   // e.g., Work -> Insight
  | "correlated_with"   // e.g., Giving -> Insight
  | "canonized_into"    // e.g., Insight -> Scripture
  | "observed_in";      // e.g., Campaign -> Insight

export interface CGEdge {
  from: string;
  to: string;
  type: CGEdgeType;
  strength: number; // 0-1 confidence of causal linkage
  timestamp: string;
}

export interface CGLinage {
  rootId: string;
  path: string[]; // sequence of node IDs
  depth: number;
  confidence: number;
}
