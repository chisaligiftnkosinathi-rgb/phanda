import { apiClient } from "./client";

export const humanOverrideApi = {
  getOverrideQueue: () =>
    apiClient.get("human-override/queue"),

  getOverrideById: (id: string) =>
    apiClient.get(`human-override/queue/${id}`),

  submitHumanDecision: (payload: any) =>
    apiClient.post("human-override/decision", payload),
};
