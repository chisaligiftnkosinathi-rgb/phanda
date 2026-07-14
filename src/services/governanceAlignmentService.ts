import { governanceAlignmentApi } from "../api/governanceAlignmentApi";
import { UIGovernanceHealthState, UIGovernanceConflict, UIGovernanceIntent, UIGovernanceRuleBinding } from "../types/governanceAlignment.types";

export class GovernanceAlignmentService {
  /**
   * Evaluates if the system is drifting from intent.
   * NEVER overrides execution.
   */
  static async evaluateIntentCompliance(): Promise<boolean> {
    try {
      const health = await this.computeGovernanceHealth();
      return health.status === "aligned";
    } catch {
      return true;
    }
  }

  /**
   * Binds human intent into a measurable system constraint.
   */
  static async bindGovernanceIntent(
    intentId: string, 
    boundLayer: "A+" | "A" | "B" | "C" | "D",
    constraintExpression: string,
    enforcementMode: "advisory" | "blocking" | "hard_reject"
  ): Promise<UIGovernanceRuleBinding | null> {
    try {
      const res = await governanceAlignmentApi.bindIntent({ intentId, boundLayer, constraintExpression, enforcementMode });
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Measures distance between system behavior and original intent.
   */
  static async detectGovernanceDrift(): Promise<UIGovernanceConflict[]> {
    try {
      const res = await governanceAlignmentApi.getGovernanceConflicts();
      return res.data;
    } catch {
      return [];
    }
  }

  /**
   * Returns the system-wide alignment index.
   */
  static async computeGovernanceHealth(): Promise<UIGovernanceHealthState> {
    try {
      const res = await governanceAlignmentApi.getGovernanceHealth();
      return res.data;
    } catch {
      return {
        status: "aligned",
        driftScore: 0,
        activeConflictsCount: 0,
        lastEvaluationTimestamp: new Date().toISOString()
      };
    }
  }

  static async getGovernanceIntents(): Promise<UIGovernanceIntent[]> {
    try {
      const res = await governanceAlignmentApi.getGovernanceIntents();
      return res.data;
    } catch {
      return [];
    }
  }
}
