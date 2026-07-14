import { useEffect, useState, useCallback } from "react";
import { LeadService } from "../services/leadService";
import { UILead } from "../types/lead.types";

export function useLeads() {
  const [data, setData] = useState<UILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await LeadService.getLeads();
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
