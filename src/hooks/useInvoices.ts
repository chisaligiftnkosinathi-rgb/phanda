import { useEffect, useState, useCallback } from "react";
import { InvoiceService } from "../services/invoiceService";
import { UIInvoice } from "../types/invoice.types";

export function useInvoices() {
  const [data, setData] = useState<UIInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await InvoiceService.getInvoices();
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
