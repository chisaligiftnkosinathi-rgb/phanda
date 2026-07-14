import { apiClient } from "./client";

export const selfHealingApi = {
  getConflicts: () =>
    apiClient.get("self-healing/conflicts"),

  getDriftReport: () =>
    apiClient.get("self-healing/drift"),

  getSystemHealth: () =>
    apiClient.get("self-healing/health"),

  getHealingMap: (conflictId: string) =>
    apiClient.get(`self-healing/conflicts/${conflictId}/map`),
};
