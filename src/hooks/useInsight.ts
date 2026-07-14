import { useEffect, useState } from "react";
import { InsightService } from "../services/insightService";
import { UIInsight } from "../types/insight.types";

export const useInsight = (id: string) => {
  const [data, setData] = useState<UIInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await InsightService.getInsightById(id);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  return { data, loading };
};
