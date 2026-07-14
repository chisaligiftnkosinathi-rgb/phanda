import { useEffect, useState, useCallback } from "react";
import { SelfHealingService } from "../services/selfHealingService";
import { UIMemoryConflict } from "../types/selfHealing.types";

export const useMemoryConflicts = () => {
  const [conflicts, setConflicts] = useState<UIMemoryConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SelfHealingService.detectConflicts();
      setConflicts(data);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  return { conflicts, loading, error, refresh: fetchConflicts };
};
