import { useEffect, useState, useCallback } from "react";
import { GovernanceAlignmentService } from "../services/governanceAlignmentService";
import { UIGovernanceHealthState } from "../types/governanceAlignment.types";

export const useGovernanceHealth = () => {
  const [health, setHealth] = useState<UIGovernanceHealthState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceAlignmentService.computeGovernanceHealth();
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { health, loading, refresh: fetchHealth };
};
