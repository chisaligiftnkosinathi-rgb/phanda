import { useEffect, useState, useCallback } from "react";
import { SelfHealingService } from "../services/selfHealingService";
import { UIHealingSuggestion } from "../types/selfHealing.types";

export const useHealingInsights = (conflictId: string) => {
  const [suggestions, setSuggestions] = useState<UIHealingSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!conflictId) return;
    setLoading(true);
    try {
      const data = await SelfHealingService.generateHealingMap(conflictId);
      setSuggestions(data);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [conflictId]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return { suggestions, loading, error, refresh: fetchSuggestions };
};
