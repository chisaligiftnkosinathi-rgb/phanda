import { useEffect, useState, useCallback } from "react";
import { HumanOverrideService } from "../services/humanOverrideService";
import { UIHumanOverrideRequest, UIHumanDecisionOption } from "../types/humanOverride.types";

export const useHumanOverrideDetail = (requestId: string | null) => {
  const [request, setRequest] = useState<UIHumanOverrideRequest | null>(null);
  const [options, setOptions] = useState<UIHumanDecisionOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const data = await HumanOverrideService.generateOverrideRequest(requestId);
      if (data) {
        setRequest(data);
        setOptions(HumanOverrideService.getDecisionOptions(data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { request, options, loading, refresh: fetchDetail };
};
