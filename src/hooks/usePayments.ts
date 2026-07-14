import { useEffect, useState, useCallback } from "react";
import { PaymentService } from "../services/paymentService";
import { UIPayment } from "../types/payment.types";

export function usePayments(invoiceId: string) {
  const [data, setData] = useState<UIPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await PaymentService.getPayments(invoiceId);
      setData(res);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) fetchData();
  }, [fetchData, invoiceId]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}
