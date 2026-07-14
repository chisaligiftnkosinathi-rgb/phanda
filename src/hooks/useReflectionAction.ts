import { useState } from "react";
import { ReflectionService } from "../services/reflectionService";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from '../services/guards/permissionEngine';
import { useWorkAction } from "./useWorkAction";

export function useReflectionAction(permissions: Permission[] | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // We bring in useWorkAction strictly to explicitly command the WorkService
  // AFTER reflection is successfully submitted. ReflectionService doesn't do this.
  const { updateStatus } = useWorkAction(permissions);

  const submitReflection = async (workId: string, payload: { content: string; sentiment?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Submit observation (Meaning Layer)
      const reflection = await ReflectionService.submitReflection(permissions!, workId, payload);
      
      // 2. Explicitly tell Work execution engine to transition state (Core Engine)
      // This honors the boundary: UI orchestrates, Reflection just records.
      await updateStatus(workId, "reflected");

      return reflection;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitReflection,
    loading,
    error,
  };
}
