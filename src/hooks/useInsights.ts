import { useEffect, useState, useCallback } from "react";
import { InsightService } from "../services/insightService";
import { UIInsight } from "../types/insight.types";

export const useInsights = () => {
  const [data, setData] = useState<UIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await InsightService.getInsights();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refresh: fetch };
};
