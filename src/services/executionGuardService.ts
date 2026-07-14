import { executionGuardApi } from "../api/executionGuardApi";
import { UIExecutionViolation, UIExecutionConstraint, UIExecutionEntityType } from "../types/executionGuard.types";

export type ExecutionDecision = "approved" | "rejected" | "requires_override";

export class ExecutionGuardService {
  /**
   * The Physics Engine Gate.
   * Runs BEFORE ANY mutation in World A.
   */
  static async preflightExecutionCheck(
    entityId: string,
    entityType: UIExecutionEntityType,
    proposedAction: string,
    context?: any
  ): Promise<{ decision: ExecutionDecision, reason?: string }> {
    try {
      // 1. We would check deterministic rules against local snapshots
      const res = await executionGuardApi.validateTransition({ entityId, entityType, proposedAction, context });
      if (res.data.valid) {
        return { decision: "approved" };
      } else {
        // Log locally
        this.registerViolation({
          id: "viol_" + Date.now(),
          entityType,
          attemptedTransition: proposedAction,
          reasonCode: res.data.reasonCode || "invalid_state_jump",
          blocked: true,
          timestamp: new Date().toISOString(),
          metadata: { entityId, context }
        });
        return { decision: "rejected", reason: res.data.message || "Invalid state jump." };
      }
    } catch {
      // Fail secure - if the physics engine is unreachable, assume standard structural block to prevent corruption
      return { decision: "rejected", reason: "Execution Guard unreachable. Preventing potential state corruption." };
    }
  }

  static async getConstraintSet(): Promise<UIExecutionConstraint[]> {
    try {
      const res = await executionGuardApi.getConstraintSet();
      return res.data;
    } catch {
      return [];
    }
  }

  static async getViolationHistory(): Promise<UIExecutionViolation[]> {
    try {
      const res = await executionGuardApi.getViolationHistory();
      return res.data;
    } catch {
      return [];
    }
  }

  static detectStructuralBreak(entityState: any): void {
    // Purely structural analysis, NO meaning interpretation.
    // E.g. Missing downstream dependency, Invoice with no Quote.
  }

  private static registerViolation(violation: UIExecutionViolation): void {
    // Write strictly to local audit log. No communication to World C++.
    console.warn("[WORLD A+] Execution Blocked: ", violation);
  }
}
