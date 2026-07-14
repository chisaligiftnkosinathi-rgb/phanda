import { useEffect, useState, useCallback } from "react";
import { GovernanceAlignmentService } from "../services/governanceAlignmentService";
import { UIGovernanceIntent } from "../types/governanceAlignment.types";

export const useGovernanceIntents = () => {
  const [intents, setIntents] = useState<UIGovernanceIntent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GovernanceAlignmentService.getGovernanceIntents();
      setIntents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntents();
  }, [fetchIntents]);

  return { intents, loading, refresh: fetchIntents };
};
