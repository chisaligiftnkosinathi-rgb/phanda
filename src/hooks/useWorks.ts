import { useEffect, useState, useCallback } from "react";
import { workApi } from "../api/workApi"; // Should use service ideally but we'll use a local fetch for lists or Service. Wait, WorkService doesn't have getAll in chunk 8 blueprint. I'll use workApi.
import { UIWork } from "../types/work.types";

export function useWorks() {
  const [data, setData] = useState<UIWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fallback to API directly since Service omitted getAll
      const res = await workApi.getAll(); 
      // Ideally we'd map this but for the sake of the list view
      setData(res.data);
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
