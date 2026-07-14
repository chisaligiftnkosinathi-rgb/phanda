import { humanOverrideApi } from "../api/humanOverrideApi";
import { UIHumanOverrideRequest, UIHumanDecisionOption, UIHumanOverrideDecision } from "../types/humanOverride.types";

export class HumanOverrideService {
  /**
   * Generates a frozen snapshot of the system state at a halt point.
   * NO interpretation, NO solution generation, only aggregation.
   */
  static async generateOverrideRequest(id: string): Promise<UIHumanOverrideRequest | null> {
    try {
      const res = await humanOverrideApi.getOverrideById(id);
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Pulls existing outputs from lower layers (A+, D, E, C++) to present as choices.
   * Does NOT recommend a "best" option. Does NOT invent solutions.
   */
  static getDecisionOptions(request: UIHumanOverrideRequest): UIHumanDecisionOption[] {
    return request.options;
  }

  /**
   * Writes the final human selection into the audit log.
   */
  static async recordHumanDecision(requestId: string, selectedOptionId: string, actor: string): Promise<UIHumanOverrideDecision | null> {
    try {
      const payload = {
        requestId,
        selectedOptionId,
        actor,
        timestamp: new Date().toISOString()
      };
      const res = await humanOverrideApi.submitHumanDecision(payload);
      return res.data;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the queue of all currently halted system states demanding human release.
   */
  static async getOverrideQueue(): Promise<UIHumanOverrideRequest[]> {
    try {
      const res = await humanOverrideApi.getOverrideQueue();
      return res.data;
    } catch {
      return [];
    }
  }
}
