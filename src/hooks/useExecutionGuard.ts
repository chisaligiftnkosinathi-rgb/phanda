import { useState, useCallback, useEffect } from "react";
import { ExecutionGuardService, ExecutionDecision } from "../services/executionGuardService";
import { UIExecutionEntityType, UIExecutionConstraint } from "../types/executionGuard.types";

export const useExecutionGuard = () => {
  const [constraints, setConstraints] = useState<UIExecutionConstraint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConstraints = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ExecutionGuardService.getConstraintSet();
      setConstraints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConstraints();
  }, [fetchConstraints]);

  const canExecute = async (
    entityId: string, 
    entityType: UIExecutionEntityType, 
    action: string, 
    context?: any
  ): Promise<{ decision: ExecutionDecision, reason?: string }> => {
    return await ExecutionGuardService.preflightExecutionCheck(entityId, entityType, action, context);
  };

  return { constraints, loading, canExecute, refresh: fetchConstraints };
};
