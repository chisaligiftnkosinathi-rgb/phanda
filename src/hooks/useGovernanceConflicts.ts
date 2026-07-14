import { useEffect, useState, useCallback } from "react";
import { GovernanceAlignmentService } from "../services/governanceAlignmentService";
import { UIGovernanceConflict } from "../types/governanceAlignment.types";

export const useGovernanceConflicts = () => {
  const [conflicts, setConflicts] = useState<UIGovernanceConflict[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceAlignmentService.detectGovernanceDrift();
      setConflicts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  return { conflicts, loading, refresh: fetchConflicts };
};
