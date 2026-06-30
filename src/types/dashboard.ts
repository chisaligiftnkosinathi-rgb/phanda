/**
 * Dashboard Type Definitions
 *
 * Unified payload for dashboard business snapshot.
 * Represents the complete state of a steward's business at a glance.
 */

import type { TrustScore, VisibilityStatus } from './trust';
import type { EarningsSummary } from './wallet';
import type { Notification } from './notifications';

/**
 * Merchant business info display
 */
export interface MerchantInfo {
  id: string;
  account_holder_name: string;
  verification_status: 'unverified' | 'verified' | 'rejected';
  payout_enabled: boolean;
  created_at: string;
}

/**
 * Trust and visibility snapshot
 */
export interface TrustInfo {
  score: TrustScore;
  visibility: VisibilityStatus;
  verification_required: boolean;
  next_review_date?: string;
}

/**
 * Wallet financial snapshot
 */
export interface WalletInfo {
  pending_amount: string;
  available_amount: string;
  paid_amount: string;
  currency: string;
  last_updated: string;
}

/**
 * Current opportunities summary
 */
export interface OpportunityInfo {
  total_available: number;
  active_jobs: number;
  pending_proof_count: number;
  completed_today: number;
}

/**
 * Recent notifications summary
 */
export interface NotificationInfo {
  total_unread: number;
  recent: Notification[];
  has_unread_payment: boolean;
  has_unread_proof: boolean;
}

/**
 * System connectivity and sync status
 */
export interface SystemStatus {
  status: 'online' | 'degraded' | 'offline';
  api_healthy: boolean;
  last_sync: string; // ISO datetime
  pending_sync_count: number;
  sync_in_progress: boolean;
}

/**
 * Complete dashboard snapshot
 *
 * Single unified payload representing the entire business state.
 * Later replaceable with single backend endpoint:
 *   GET /api/v1/dashboard
 */
export interface DashboardData {
  merchant: MerchantInfo;
  trust: TrustInfo;
  wallet: WalletInfo;
  opportunities: OpportunityInfo;
  notifications: NotificationInfo;
  systemHealth: SystemStatus;
  timestamp: string; // When snapshot was captured
}

/**
 * Dashboard loading state
 */
export interface DashboardLoadingState {
  merchant: boolean;
  trust: boolean;
  wallet: boolean;
  opportunities: boolean;
  notifications: boolean;
  systemHealth: boolean;
}

/**
 * Dashboard error state
 */
export interface DashboardErrorState {
  merchant?: string;
  trust?: string;
  wallet?: string;
  opportunities?: string;
  notifications?: string;
  systemHealth?: string;
}

/**
 * Complete dashboard hook response
 */
export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: DashboardLoadingState;
  errors: DashboardErrorState;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  lastRefetch: string | null;
}
