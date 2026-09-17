import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storefrontApi } from '../api/storefrontApi';
import type {
  StorefrontResponse,
  CheckoutPayload,
  CheckoutResult,
  OnboardStorePayload,
  OnboardStoreResult,
} from '../types/storefront';
import { sharedQueryKeys } from '@/shared/queryKeys';

export const storefrontQueryKeys = {
  all: ['storefront'] as const,
  detail: (slug: string) => [...storefrontQueryKeys.all, 'detail', slug] as const,
};

export function useMerchantStorefront(slug: string, options?: { enabled?: boolean }) {
  return useQuery<StorefrontResponse>({
    queryKey: storefrontQueryKeys.detail(slug),
    queryFn: () => storefrontApi.getStorefront(slug),
    enabled: options?.enabled !== undefined ? options.enabled : !!slug,
    staleTime: 60 * 1000, // 1 minute fresh cache
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation<CheckoutResult, Error, CheckoutPayload>({
    mutationFn: (payload: CheckoutPayload) => storefrontApi.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}

export function useOnboardStore() {
  const queryClient = useQueryClient();

  return useMutation<OnboardStoreResult, Error, OnboardStorePayload>({
    mutationFn: (payload: OnboardStorePayload) => storefrontApi.onboardStore(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['business'] });
    },
  });
}
