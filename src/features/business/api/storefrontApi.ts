import { AXIOS_INSTANCE } from '@/shared/api/client';
import type {
  StorefrontResponse,
  CheckoutPayload,
  CheckoutResult,
  OnboardStorePayload,
  OnboardStoreResult,
} from '../types/storefront';

export const storefrontApi = {
  /**
   * Fetch a merchant's full public storefront (profile + product/service catalog).
   */
  getStorefront: async (slug: string): Promise<StorefrontResponse> => {
    const { data } = await AXIOS_INSTANCE.get<StorefrontResponse>(`/api/v1/storefronts/merchant/${slug}`);
    return data;
  },

  /**
   * Submit an order for checkout across physical products or craftsman services.
   */
  checkout: async (payload: CheckoutPayload): Promise<CheckoutResult> => {
    const { data } = await AXIOS_INSTANCE.post<CheckoutResult>('/api/v1/orders/checkout', payload);
    return data;
  },

  /**
   * Onboard a store, claim its unique slug, and register South African bank payout details.
   */
  onboardStore: async (payload: OnboardStorePayload): Promise<OnboardStoreResult> => {
    const { data } = await AXIOS_INSTANCE.post<OnboardStoreResult>('/api/v1/profiles/me/onboard-store', payload);
    return data;
  },
};
