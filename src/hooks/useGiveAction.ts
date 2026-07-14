import { useState } from "react";
import { GivingService } from "../services/givingService";
import { UIGiving } from "../types/giving.types";

export const useGiveAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitGive = async (payload: Partial<UIGiving>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await GivingService.createGive(payload);
      return res;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { submitGive, loading, error };
};
