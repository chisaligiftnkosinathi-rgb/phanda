import { useEffect, useState } from "react";
import { QuoteService } from "../services/quoteService";
import { UIQuote } from "../types/quote.types";

export function useQuote(id: string) {
  const [data, setData] = useState<UIQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await QuoteService.getQuote(id);
        setData(res);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) run();
  }, [id]);

  return { data, loading, error };
}
