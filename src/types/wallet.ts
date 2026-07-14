/**
 * Wallet & Earnings Type Definitions
 *
 * Types for wallet operations, earnings tracking, and payout lifecycle.
 */

/**
 * Earnings summary for current wallet
 */
export interface EarningsSummary {
    pending_amount: number;
    available_amount: number;
    paid_amount: number;
    total_earned: number;
    currency: string;
    last_updated: string;
}

/**
 * Individual earning ledger entry
 */
export interface EarningEntry {
    id: string;
    opportunity_id: string;
    amount: number;
    status: 'pending' | 'verified' | 'failed';
    earned_at: string;
    verified_at?: string;
    notes?: string;
}

/**
 * Payout request to transfer earnings to bank account
 */
export interface PayoutRequestData {
    amount: number;
    notes?: string;
}

/**
 * Payout request response with status
 */
export interface PayoutResponse {
    payout_id: string;
    amount: number;
    status: 'requested' | 'processing' | 'completed' | 'failed';
    requested_at: string;
    processed_at?: string;
    error_message?: string;
}

/**
 * Payout history entry
 */
export interface PayoutHistoryEntry {
    payout_id: string;
    amount: number;
    status: 'requested' | 'processing' | 'completed' | 'failed';
    requested_at: string;
    processed_at?: string;
    bank_account_last4?: string;
}

/**
 * Filter for earnings/payout queries
 */
export interface WalletFilter {
    startDate?: string;
    endDate?: string;
    status?: 'pending' | 'verified' | 'failed' | 'all';
    opportunityId?: string;
    limit?: number;
    offset?: number;
}

/**
 * Wallet balance snapshot
 */
export interface WalletBalance {
    pending: number;
    available: number;
    paid: number;
    total: number;
    currency: string;
}
