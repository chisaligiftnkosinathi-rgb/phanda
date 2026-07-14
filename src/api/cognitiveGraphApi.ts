import { apiClient } from "./client";

export const cognitiveGraphApi = {
  getNodes: () =>
    apiClient.get("cognitive-graph/nodes"),

  getEdges: () =>
    apiClient.get("cognitive-graph/edges"),

  getLineage: (nodeId: string) =>
    apiClient.get(`cognitive-graph/lineage/${nodeId}`),

  getExplanation: (nodeId: string) =>
    apiClient.get(`cognitive-graph/explain/${nodeId}`),
};
