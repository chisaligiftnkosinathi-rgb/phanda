import { apiClient } from "./client";

export const executionGuardApi = {
  validateTransition: (payload: any) =>
    apiClient.post("execution-guard/validate", payload),

  getConstraintSet: () =>
    apiClient.get("execution-guard/constraints"),

  getViolationHistory: () =>
    apiClient.get("execution-guard/violations"),
};
