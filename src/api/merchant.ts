/**
 * Merchant Account API
 *
 * Exposes merchant account management endpoints:
 * - Account creation and verification
 * - Payout configuration
 * - Earnings tracking
 */

import { apiClient } from './client';
import type {
  MerchantAccount,
  MerchantAccountCreate,
  MerchantAccountUpdate,
  MerchantVerificationRequest,
  EarningLedger,
  PayoutRequest,
  PayoutHistory,
} from '@/types/merchant';

export const merchantApi = {
  /**
   * Get current user's merchant account
   */
  getAccount: async (): Promise<MerchantAccount> => {
    const response = await apiClient.get('/merchant/account');
    return response.data;
  },

  /**
   * Create a new merchant account for current user
   */
  createAccount: async (data: MerchantAccountCreate): Promise<MerchantAccount> => {
    const response = await apiClient.post('/merchant/account', data);
    return response.data;
  },

  /**
   * Update merchant account details
   */
  updateAccount: async (data: MerchantAccountUpdate): Promise<MerchantAccount> => {
    const response = await apiClient.patch('/merchant/account', data);
    return response.data;
  },

  /**
   * Submit verification proof for merchant account
   */
  submitVerification: async (data: MerchantVerificationRequest): Promise<MerchantAccount> => {
    const response = await apiClient.post('/merchant/account/verify', data);
    return response.data;
  },

  /**
   * Get current earning ledger entries for user
   */
  getEarnings: async (filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<EarningLedger[]> => {
    const response = await apiClient.get('/merchant/earnings', { params: filters });
    return response.data;
  },

  /**
   * Get payout history for merchant
   */
  getPayoutHistory: async (filters?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<PayoutHistory[]> => {
    const response = await apiClient.get('/merchant/payouts', { params: filters });
    return response.data;
  },

  /**
   * Request a payout from available earnings
   */
  requestPayout: async (amount: number): Promise<PayoutRequest> => {
    const response = await apiClient.post('/merchant/payouts/request', {
      amount,
    });
    return response.data;
  },

  /**
   * Get current payout status
   */
  getPayoutStatus: async (): Promise<PayoutRequest | null> => {
    const response = await apiClient.get('/merchant/payouts/current');
    return response.data || null;
  },

  /**
   * Get available balance for payout
   */
  getAvailableBalance: async (): Promise<{
    available_amount: number;
    currency: string;
    can_payout: boolean;
    minimum_required: number;
  }> => {
    const response = await apiClient.get('/merchant/balance');
    return response.data;
  },
};
