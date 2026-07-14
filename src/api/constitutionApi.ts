import { apiClient } from "./client";

export const constitutionApi = {
  getArticles: () =>
    apiClient.get("constitution/articles"),

  getViolations: () =>
    apiClient.get("constitution/violations"),

  getAmendments: () =>
    apiClient.get("constitution/amendments"),

  submitAmendment: (payload: any) =>
    apiClient.post("constitution/amendments", payload),
};
