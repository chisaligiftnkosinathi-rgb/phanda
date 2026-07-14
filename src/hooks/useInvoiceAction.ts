import { useState } from "react";
import { InvoiceService } from "../services/invoiceService";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from '../services/guards/permissionEngine';

export function useInvoiceAction(permissions: Permission[] | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateFromQuote = async (quoteId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await InvoiceService.generateFromQuote(permissions!, quoteId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (invoiceId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await InvoiceService.markPaid(permissions!, invoiceId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateFromQuote,
    markPaid,
    loading,
    error,
  };
}
