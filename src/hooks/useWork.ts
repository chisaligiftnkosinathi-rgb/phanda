import { useEffect, useState } from "react";
import { WorkService } from "../services/workService";
import { UIWork } from "../types/work.types";

export function useWork(id: string) {
  const [data, setData] = useState<UIWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await WorkService.getWork(id);
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
