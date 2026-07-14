import { apiClient } from "./client";

export const governanceAlignmentApi = {
  getGovernanceIntents: () =>
    apiClient.get("governance-alignment/intents"),

  getGovernanceHealth: () =>
    apiClient.get("governance-alignment/health"),

  getGovernanceConflicts: () =>
    apiClient.get("governance-alignment/conflicts"),

  bindIntent: (payload: any) =>
    apiClient.post("governance-alignment/bind", payload),
};
