/**
 * Dashboard API Module
 *
 * Phase 4 — Home Dashboard (Backend-for-Frontend)
 *
 * Single endpoint that returns merchant, trust, wallet, opportunities,
 * notifications, and platform data in one response.
 *
 * This replaces the previous pattern of making 6 separate API calls.
 * One call → full dashboard state.
 */

import { apiClient } from './client';

// ─── Section envelope ────────────────────────────────────────────────────────

export type DashboardSectionStatus = 'ok' | 'error' | 'loading';

export interface DashboardSection<T> {
    status: DashboardSectionStatus;
    data: T | null;
    error: string | null;
}

// ─── Section data types ───────────────────────────────────────────────────────

export interface MerchantInfo {
    id: string;
    user_id: string;
    account_holder_name: string;
    verification_status: string;
    payout_enabled: boolean;
    bank_name: string;
    account_type: string;
    created_at: string;
    is_active: boolean;
}

export interface TrustScoreInfo {
    overall_score: number;
    identity_score: number;
    proof_score: number;
    economic_score: number;
    activity_score: number;
    visibility_score: number;
    work_proof_count: number;
    opportunity_completion_rate: number;
}

export interface VisibilityInfo {
    visibility_state: string | null;
    visibility_score: number;
    is_verified: boolean;
}

export interface TrustInfo {
    score: TrustScoreInfo;
    visibility: VisibilityInfo;
    verification_required: boolean;
}

export interface WalletInfo {
    pending_amount: string;
    available_amount: string;
    paid_amount: string;
    currency: string;
    last_updated: string;
}

export interface OpportunitiesInfo {
    total_available: number;
    active_jobs: number;
    pending_proof_count: number;
    completed_today: number;
}

export interface NotificationInfo {
    total_unread: number;
    has_unread_payment: boolean;
    has_unread_proof: boolean;
}

export interface PlatformInfo {
    version: string;
    maintenance: boolean;
    api_healthy: boolean;
    minimum_app_version: string | null;
    feature_flags: Record<string, unknown>;
    announcements: string[];
}

// ─── Full response ────────────────────────────────────────────────────────────

export interface DashboardResponse {
    schema_version: number;
    timestamp: string;
    generated_in_ms: number;
    merchant: DashboardSection<MerchantInfo>;
    trust: DashboardSection<TrustInfo>;
    wallet: DashboardSection<WalletInfo>;
    opportunities: DashboardSection<OpportunitiesInfo>;
    notifications: DashboardSection<NotificationInfo>;
    platform: DashboardSection<PlatformInfo>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function sectionOk<T>(section?: DashboardSection<T>): section is DashboardSection<T> & { data: T } {
    return !!section && section.status === 'ok' && section.data !== null;
}

/** Returns true if overall dashboard is fully healthy */
export function dashboardFullyLoaded(response: DashboardResponse): boolean {
    return (
        sectionOk(response.merchant) &&
        sectionOk(response.trust) &&
        sectionOk(response.wallet)
    );
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const dashboardApi = {
    /**
     * GET /api/v1/dashboard
     * Requires JWT. Returns full steward dashboard in one request.
     *
     * Implements graceful degradation — if one section fails, others still load.
     * Check section.status === 'ok' before rendering each section.
     */
    get: async (): Promise<DashboardResponse> => {
        const response = await apiClient.get<DashboardResponse>('dashboard');
        return response.data;
    },
};
