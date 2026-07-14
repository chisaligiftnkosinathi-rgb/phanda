import { useEffect, useState, useCallback } from "react";
import { HumanOverrideService } from "../services/humanOverrideService";
import { UIHumanOverrideRequest } from "../types/humanOverride.types";

export const useHumanOverrides = () => {
  const [overrides, setOverrides] = useState<UIHumanOverrideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverrides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await HumanOverrideService.getOverrideQueue();
      setOverrides(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverrides();
  }, [fetchOverrides]);

  return { overrides, loading, refresh: fetchOverrides };
};
