/**
 * Finance & Wallet API
 *
 * Exposes wallet and ledger reconciliation endpoints:
 * - Wallet summary (pending, available, paid earnings)
 * - Transaction history
 * - Payment reconciliation
 * - Platform fees transparency
 */

import { apiClient } from './client';
import type {
  WalletSummary,
  PaymentTransaction,
  FeeLedger,
  TreasuryLedger,
  EarningLedgerFinance,
  ReconciliationReport,
  TransactionFilter,
} from '@/types/finance';

export const financeApi = {
  /**
   * Get wallet summary: pending, available, paid earnings + platform fees
   */
  getWalletSummary: async (): Promise<WalletSummary> => {
    const response = await apiClient.get('/finance/wallet/summary');
    return response.data;
  },

  /**
   * Get all transactions for current user
   */
  getTransactions: async (filters?: TransactionFilter): Promise<PaymentTransaction[]> => {
    const response = await apiClient.get('/finance/transactions', { params: filters });
    return response.data;
  },

  /**
   * Get pending earnings (awaiting proof verification)
   */
  getPendingEarnings: async (): Promise<EarningLedgerFinance[]> => {
    const response = await apiClient.get('/finance/earnings/pending');
    return response.data;
  },

  /**
   * Get available earnings (ready for payout)
   */
  getAvailableEarnings: async (): Promise<EarningLedgerFinance[]> => {
    const response = await apiClient.get('/finance/earnings/available');
    return response.data;
  },

  /**
   * Get paid earnings (historical payouts)
   */
  getPaidEarnings: async (filters?: {
    limit?: number;
    offset?: number;
  }): Promise<EarningLedgerFinance[]> => {
    const response = await apiClient.get('/finance/earnings/paid', { params: filters });
    return response.data;
  },

  /**
   * Get total platform fees collected
   */
  getPlatformFees: async (): Promise<{
    total_fees: number;
    currency: string;
    breakdown: Array<{
      date: string;
      amount: number;
    }>;
  }> => {
    const response = await apiClient.get('/finance/fees');
    return response.data;
  },

  /**
   * Get full reconciliation report for a payment
   */
  reconcilePayment: async (paymentId: string): Promise<ReconciliationReport> => {
    const response = await apiClient.get(`/finance/reconcile/${paymentId}`);
    return response.data;
  },

  /**
   * Get batch reconciliation report (all payments, optionally filtered)
   */
  getReconciliationReport: async (filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    total_payments: number;
    by_status: { [key: string]: number };
    ledger_coverage: {
      payments_with_fee_ledger: number;
      payments_with_treasury_ledger: number;
      payments_with_earning_ledger: number;
      fully_allocated: number;
    };
    totals: {
      platform_fees: number;
      merchant_earnings: number;
      customer_payments: number;
    };
    imbalances: Array<{
      payment_id: string;
      payment_amount: number;
      split_total: number;
      difference: number;
    }>;
  }> => {
    const response = await apiClient.get('/finance/reconcile/batch', { params: filters });
    return response.data;
  },

  /**
   * Verify a payment manually (for dispute resolution, audits)
   */
  verifyPayment: async (
    paymentId: string,
    notes?: string
  ): Promise<{
    payment_id: string;
    verified_at: string;
    checks: {
      payment_exists: boolean;
      fee_ledger_exists: boolean;
      treasury_ledger_exists: boolean;
      earning_ledger_exists: boolean;
      payment_confirmed: boolean;
      ledger_balance_matches: boolean;
    };
    results: {
      all_ledgers_present: boolean;
      balance_check?: {
        payment_amount: number;
        treasury_amount: number;
        earning_amount: number;
        balanced: boolean;
      };
    };
  }> => {
    const response = await apiClient.post(`/finance/reconcile/verify`, {
      payment_intent_id: paymentId,
      notes,
    });
    return response.data;
  },

  /**
   * Get next payout date/schedule
   */
  getPayoutSchedule: async (): Promise<{
    next_payout_date?: string;
    frequency: string;
    minimum_amount: number;
    processing_days: number;
  }> => {
    const response = await apiClient.get('/finance/payout-schedule');
    return response.data;
  },
};
