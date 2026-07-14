/**
 * Finance & Wallet Types
 * Represents ledger entries, transactions, and wallet state
 */

export interface WalletSummary {
  pending_earnings: number;
  available_earnings: number;
  paid_earnings: number;
  platform_fees_total: number;
  currency: string;
  last_payout?: PaymentTransaction;
  next_payout_eligible_at?: string;
}

export interface PaymentTransaction {
  id: string;
  payment_intent_id: string;
  type: 'platform_fee' | 'provider_earning' | 'adjustment' | 'refund' | 'reversal' | 'chargeback';
  amount: number;
  currency: string;
  status: 'created' | 'allocated' | 'settled' | 'reversed';
  created_at: string;
  settled_at?: string;
}

export interface FeeLedger {
  id: string;
  payment_intent_id: string;
  total_amount: number;
  platform_fee_percent: number;
  platform_fee_amount: number;
  provider_amount: number;
  currency: string;
  status: 'created' | 'allocated' | 'settled';
  created_at: string;
  updated_at: string;
}

export interface TreasuryLedger {
  id: string;
  payment_intent_id: string;
  fee_ledger_id: string;
  amount: number;
  currency: string;
  entry_type: 'platform_fee' | 'adjustment' | 'refund' | 'reversal' | 'chargeback';
  owner: string;
  status: 'created' | 'allocated' | 'settled' | 'reversed';
  settlement_reference?: string;
  settlement_memo?: string;
  created_at: string;
  settled_at?: string;
}

export interface EarningLedgerFinance {
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
}

export interface ReconciliationReport {
  payment_intent_id: string;
  payment_status: string;
  payment_amount: number;
  fee_ledger?: FeeLedger;
  treasury_ledger?: TreasuryLedger;
  earning_ledger?: EarningLedgerFinance;
  is_balanced: boolean;
  balance_check: {
    payment_amount: number;
    treasury_amount: number;
    earning_amount: number;
    matches_payment: boolean;
  };
}

export interface PlatformConfig {
  key: string;
  scope: string;
  value_type: 'decimal' | 'string' | 'boolean';
  decimal_value?: number;
  string_value?: string;
  boolean_value?: boolean;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
}

export interface TransactionFilter {
  status?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}
