import { useEffect, useState, useCallback } from "react";
import { ExecutionGuardService } from "../services/executionGuardService";
import { UIExecutionViolation } from "../types/executionGuard.types";

export const useExecutionViolations = () => {
  const [violations, setViolations] = useState<UIExecutionViolation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ExecutionGuardService.getViolationHistory();
      setViolations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  return { violations, loading, refresh: fetchViolations };
};
