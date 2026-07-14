import { apiClient } from "./client";

export const constraintEvolutionApi = {
  getConstraintProposals: () =>
    apiClient.get("constraint-evolution/proposals"),

  getConstraintVersions: () =>
    apiClient.get("constraint-evolution/versions"),

  getSimulationResults: (proposalId: string) =>
    apiClient.get(`constraint-evolution/simulations/${proposalId}`),
};
