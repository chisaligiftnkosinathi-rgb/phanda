import { apiClient } from "./client";

export const insightApi = {
  // Triggers recomputation (manual or scheduled)
  generateInsights: () =>
    apiClient.post("insights/generate", {}),

  getInsights: () =>
    apiClient.get("insights"),

  getInsightById: (id: string) =>
    apiClient.get(`insights/${id}`),

  getInsightsByType: (type: string) =>
    apiClient.get(`insights/type/${type}`),
};
