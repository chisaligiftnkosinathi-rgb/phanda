import { useState } from "react";
import { QuoteService } from "../services/quoteService";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from '../services/guards/permissionEngine';

export function useQuoteAction(permissions: Permission[] | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateFromLead = async (leadId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await QuoteService.generateFromLead(permissions!, leadId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const sendQuote = async (quoteId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await QuoteService.sendQuote(permissions!, quoteId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  
  const acceptQuote = async (quoteId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await QuoteService.acceptQuote(quoteId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const rejectQuote = async (quoteId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await QuoteService.rejectQuote(quoteId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateFromLead,
    sendQuote,
    acceptQuote,
    rejectQuote,
    loading,
    error,
  };
}
