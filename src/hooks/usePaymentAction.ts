import { useState } from "react";
import { PaymentService } from "../services/paymentService";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from '../services/guards/permissionEngine';

export function usePaymentAction(permissions: Permission[] | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const processPayment = async (invoiceId: string, payload: any) => {
    try {
      setLoading(true);
      setError(null);
      return await PaymentService.processPayment(permissions!, invoiceId, payload);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error,
  };
}
