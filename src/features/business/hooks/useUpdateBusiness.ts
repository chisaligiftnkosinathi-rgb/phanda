/**
 * useUpdateBusiness Hook
 *
 * Mutations for granular business updates.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '../api/businessApi';
import { useSession } from '@/features/auth/hooks/useAuth';
import type { BusinessProjection } from '../types';

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  const { selectedBusiness } = useSession();

  const businessId = selectedBusiness?.id;

  return useMutation({
    mutationFn: async (payload: Partial<BusinessProjection>) => {
      if (!businessId) throw new Error('No business selected');
      return businessApi.updateBusiness(businessId, payload);
    },
    onSuccess: () => {
      // Invalidate both the specific business detail and the global bootstrap
      // to keep the Platform Kernel strictly synchronized.
      queryClient.invalidateQueries({ queryKey: ['business', 'detail', businessId] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
    },
  });
}
