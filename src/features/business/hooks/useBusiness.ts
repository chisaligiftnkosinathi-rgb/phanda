/**
 * useBusiness Hook
 *
 * Retrieves the currently active business's full profile data.
 */

import { useQuery } from '@tanstack/react-query';
import { businessApi } from '../api/businessApi';
import { mapBusiness } from '../mappers/businessMapper';
import { useSession } from '@/features/auth';
import { useGetPublicProfileApiV1PublicSlugGet } from '@/generated/api';

export function usePublicProfile(slug: string, options?: any) {
  return useGetPublicProfileApiV1PublicSlugGet(slug, options);
}

export function useBusiness() {
  const { selectedBusiness, authenticated } = useSession();

  const businessId = selectedBusiness?.id;

  const query = useQuery({
    // Standardized key without exposing the ID to components
    queryKey: ['business', 'detail', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('No business selected');
      const dto = await businessApi.getBusiness(businessId);
      return mapBusiness(dto);
    },
    enabled: authenticated && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    business: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
