import { useEffect, useState, useCallback } from "react";
import { GivingService } from "../services/givingService";
import { UIGiving } from "../types/giving.types";

export const useGiving = (userId: string) => {
  const [data, setData] = useState<UIGiving[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await GivingService.getGivenByUser(userId);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refresh: fetch };
};
