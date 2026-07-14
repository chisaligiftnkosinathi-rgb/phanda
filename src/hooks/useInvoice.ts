import { useEffect, useState } from "react";
import { InvoiceService } from "../services/invoiceService";
import { UIInvoice } from "../types/invoice.types";

export function useInvoice(id: string) {
  const [data, setData] = useState<UIInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await InvoiceService.getInvoice(id);
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
