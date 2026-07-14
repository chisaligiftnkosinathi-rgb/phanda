import { useEffect, useState, useCallback } from "react";
import { QuoteService } from "../services/quoteService";
import { UIQuote } from "../types/quote.types";

export function useQuotes() {
  const [data, setData] = useState<UIQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await QuoteService.getQuotes();
      setData(res);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}
