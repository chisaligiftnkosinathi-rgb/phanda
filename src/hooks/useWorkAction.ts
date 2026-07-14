import { useState } from "react";
import { WorkService } from "../services/workService";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from '../services/guards/permissionEngine';

export function useWorkAction(permissions: Permission[] | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createFromInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await WorkService.createFromInvoice(permissions!, invoiceId);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      return await WorkService.updateStatus(id, status);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (id: string, expense: any) => {
    try {
      setLoading(true);
      setError(null);
      return await WorkService.addExpense(id, expense);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const completeWork = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      // NOTE: Completion transitions status to 'completed', not final closure.
      // Next step in lifecycle is reflection_pending -> reflected.
      return await WorkService.completeWork(id);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    createFromInvoice,
    updateStatus,
    addExpense,
    completeWork,
    loading,
    error,
  };
}
