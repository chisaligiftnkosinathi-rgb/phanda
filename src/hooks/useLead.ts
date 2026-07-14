import { useEffect, useState } from "react";
import { LeadService } from "../services/leadService";
import { UILead } from "../types/lead.types";

export function useLead(id: string) {
  const [data, setData] = useState<UILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await LeadService.getLead(id);
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
