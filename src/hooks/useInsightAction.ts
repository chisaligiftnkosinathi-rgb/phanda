import { useState } from "react";
import { InsightService } from "../services/insightService";

export const useInsightAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const recompute = async () => {
    setLoading(true);
    setError(null);
    try {
      return await InsightService.generateInsights();
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { recompute, loading, error };
};
