import { useEffect, useState, useCallback } from "react";
import { SelfHealingService } from "../services/selfHealingService";
import { UISystemHealthStatus } from "../types/selfHealing.types";

export const useSelfHealing = () => {
  const [healthStatus, setHealthStatus] = useState<UISystemHealthStatus>("healthy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const status = await SelfHealingService.classifySystemHealth();
      setHealthStatus(status);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { healthStatus, loading, error, refresh: fetchHealth };
};
