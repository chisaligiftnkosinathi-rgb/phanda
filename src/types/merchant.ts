/**
 * Merchant Account Types
 * Represents service provider payout configuration and verification status
 */

export interface MerchantAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  branch_code: string;
  verification_status: 'unverified' | 'verified' | 'rejected';
  payout_enabled: boolean;
  minimum_balance_for_payout: number;
  created_at: string;
  updated_at: string;
}

export interface MerchantAccountCreate {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  branch_code: string;
}

export interface MerchantAccountUpdate {
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  branch_code?: string;
}

export interface MerchantVerificationRequest {
  proof_of_ownership_url: string;
  notes?: string;
}

export interface EarningLedger {
  id: string;
  user_id: string;
  merchant_account_id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'available' | 'paid' | 'reversed';
  pending_at?: string;
  available_at?: string;
  paid_at?: string;
  reversed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayoutRequest {
  id: string;
  merchant_account_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bank_transfer_reference?: string;
  requested_at: string;
  completed_at?: string;
  error_reason?: string;
}

export interface PayoutHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending';
  bank_transfer_reference?: string;
  processed_at: string;
  error_reason?: string;
}
