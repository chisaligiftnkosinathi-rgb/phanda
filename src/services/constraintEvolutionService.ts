import { constraintEvolutionApi } from "../api/constraintEvolutionApi";
import { UIConstraintProposal, UIConstraintImpactSimulation, UIConstraintVersion } from "../types/constraintEvolution.types";

export class ConstraintEvolutionService {
  /**
   * Generates candidate proposals based on C++ and A+ patterns.
   * Evaluates ONLY against observable system metrics (violation frequency, conflict density, stability variance).
   * EXPLICITLY FORBIDS semantic "improvement" judgments.
   */
  static async generateConstraintProposals(): Promise<UIConstraintProposal[]> {
    try {
      const res = await constraintEvolutionApi.getConstraintProposals();
      return res.data;
    } catch {
      return [];
    }
  }

  /**
   * Runs a dry simulation. What breaks if this rule changes?
   * Evaluates stability metrics, not semantic optimization.
   */
  static async simulateProposalImpact(proposalId: string): Promise<UIConstraintImpactSimulation | null> {
    try {
      const res = await constraintEvolutionApi.getSimulationResults(proposalId);
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Ranks proposals purely based on instability reduction metrics.
   * Higher rank = greater reduction in A+ violations and C++ contradictions.
   */
  static rankConstraintProposals(proposals: UIConstraintProposal[]): UIConstraintProposal[] {
    return [...proposals].sort((a, b) => {
      // Prioritize proposals that increase stability (reduce violations & contradictions)
      const aGain = a.simulationOutcome.stabilityDelta - a.simulationOutcome.predictedViolationsDelta;
      const bGain = b.simulationOutcome.stabilityDelta - b.simulationOutcome.predictedViolationsDelta;
      return bGain - aGain;
    });
  }

  /**
   * Retrieves versions of the constraint rulebook over time.
   */
  static async getConstraintVersions(): Promise<UIConstraintVersion[]> {
    try {
      const res = await constraintEvolutionApi.getConstraintVersions();
      return res.data;
    } catch {
      return [];
    }
  }
}
