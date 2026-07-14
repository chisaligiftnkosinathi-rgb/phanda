import { useState } from "react";
import { LeadService } from "../services/leadService";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from '../services/guards/permissionEngine';

export function useLeadAction(permissions: Permission[] | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createLead = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      return await LeadService.createLead(permissions!, payload);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const convertToQuote = async (leadId: string, payload: any) => {
    try {
      setLoading(true);
      setError(null);
      return await LeadService.convertToQuote(permissions!, leadId, payload);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const convertToInvoice = async (leadId: string, payload: any) => {
    try {
      setLoading(true);
      setError(null);
      return await LeadService.convertToInvoice(permissions!, leadId, payload);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    createLead,
    convertToQuote,
    convertToInvoice,
    loading,
    error,
  };
}
