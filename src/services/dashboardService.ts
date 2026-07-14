/**
 * Dashboard Service
 *
 * Single source of truth for dashboard data.
 *
 * Architecture:
 *   ONE request → GET /api/v1/dashboard
 *   ONE response → DashboardResponse (backend envelope)
 *   ONE normalizer → DashboardData (UI view model)
 */

import { dashboardApi, sectionOk } from '@/api/dashboard';
import type { DashboardResponse, DashboardSection } from '@/api/dashboard';
import type {
    DashboardData,
    DashboardWidget,
    WidgetState,
    MerchantInfo,
    NotificationInfo,
    OpportunityInfo,
    SystemStatus,
    TrustInfo,
    WalletInfo,
} from '@/types/dashboard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapGlobalErrorToState(err: any): { state: WidgetState; message: string } {
    if (err?.response) {
        const status = err.response.status;
        switch (status) {
            case 401: return { state: 'sessionExpired', message: 'Please sign in again' };
            case 403: return { state: 'forbidden', message: "You don't have permission" };
            case 404: return { state: 'unavailable', message: 'Not available' };
            case 409: return { state: 'conflict', message: 'Refresh required' };
            case 429: return { state: 'throttled', message: 'Too many requests' };
            case 500: return { state: 'platformError', message: 'Temporary platform error' };
            case 503: return { state: 'maintenance', message: 'Platform under maintenance' };
        }
    }
    
    // Check if network error (offline)
    if (err?.message === 'Network Error' || err?.message?.includes('Network') || err?.isAxiosError && !err.response) {
        return { state: 'offline', message: 'Showing last available snapshot' };
    }

    return { state: 'unavailable', message: err instanceof Error ? err.message : 'Unknown error' };
}

function resolveSectionState<T>(section: DashboardSection<T>): { state: WidgetState; message: string | null } {
    if (section.status === 'ok') {
        return { state: 'live', message: null };
    }
    if (section.status === 'loading') {
        return { state: 'loading', message: 'Preparing data' };
    }
    return { state: 'unavailable', message: section.error ?? 'Not available' };
}

// ─── Section normalizers ──────────────────────────────────────────────────────

function normalizeMerchant(section: DashboardSection<any>): DashboardWidget<MerchantInfo> {
    const { state, message } = resolveSectionState(section);
    
    if (sectionOk(section)) {
        const d = section.data;
        return {
            state,
            message,
            data: {
                id: d.id,
                account_holder_name: d.account_holder_name,
                verification_status: d.verification_status,
                payout_enabled: d.payout_enabled,
                created_at: d.created_at,
            },
        };
    }

    return { state, message, data: null };
}

function normalizeTrust(section: DashboardSection<any>): DashboardWidget<TrustInfo> {
    const { state, message } = resolveSectionState(section);

    if (sectionOk(section)) {
        const d = section.data;
        const score = d.score;
        const vis = d.visibility;

        return {
            state,
            message,
            data: {
                score: {
                    user_id: 'me',
                    overall_score: score.overall_score,
                    verification_score: score.identity_score ?? 0,
                    completion_score: score.opportunity_completion_rate ?? 0,
                    visibility_score: score.visibility_score ?? 0,
                    components: {
                        verified_profile: (score.identity_score ?? 0) > 0,
                        verified_merchant_account: (score.economic_score ?? 0) > 0,
                        successful_payments: score.work_proof_count ?? 0,
                        successful_proofs: score.work_proof_count ?? 0,
                        on_time_completion_rate: score.opportunity_completion_rate ?? 0,
                    },
                    calculated_at: new Date().toISOString(),
                },
                visibility: {
                    user_id: 'me',
                    is_visible: vis.is_verified ?? false,
                    visibility_reason: vis.visibility_state ?? 'Not yet verified',
                    trust_level: 'new',
                    visibility_percentage: vis.visibility_score ?? 0,
                },
                verification_required: !(vis.is_verified ?? false),
            },
        };
    }

    return { state, message, data: null };
}

function normalizeWallet(section: DashboardSection<any>): DashboardWidget<WalletInfo> {
    const { state, message } = resolveSectionState(section);

    if (sectionOk(section)) {
        const d = section.data;
        return {
            state,
            message,
            data: {
                pending_amount: d.pending_amount,
                available_amount: d.available_amount,
                paid_amount: d.paid_amount,
                currency: d.currency,
                last_updated: d.last_updated,
            },
        };
    }

    return { state, message, data: null };
}

function normalizeOpportunities(section: DashboardSection<any>): DashboardWidget<OpportunityInfo> {
    const { state, message } = resolveSectionState(section);

    if (sectionOk(section)) {
        const d = section.data;
        return {
            state,
            message,
            data: {
                total_available: d.total_available,
                active_jobs: d.active_jobs,
                pending_proof_count: d.pending_proof_count,
                completed_today: d.completed_today,
            },
        };
    }

    return { state, message, data: null };
}

function normalizeNotifications(section: DashboardSection<any>): DashboardWidget<NotificationInfo> {
    const { state, message } = resolveSectionState(section);

    if (sectionOk(section)) {
        const d = section.data;
        return {
            state,
            message,
            data: {
                total_unread: d.total_unread,
                recent: [],
                has_unread_payment: d.has_unread_payment,
                has_unread_proof: d.has_unread_proof,
            },
        };
    }

    return { state, message, data: null };
}

function normalizeSystemHealth(section: DashboardSection<any>, timestamp: string): DashboardWidget<SystemStatus> {
    const { state, message } = resolveSectionState(section);

    if (sectionOk(section)) {
        const d = section.data;
        const statusStr: SystemStatus['status'] = d.maintenance ? 'degraded' : d.api_healthy ? 'online' : 'offline';
        return {
            state,
            message,
            data: {
                status: statusStr,
                api_healthy: d.api_healthy,
                last_sync: timestamp,
                pending_sync_count: 0,
                sync_in_progress: false,
            },
        };
    }

    return { state, message, data: null };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function normalizeDashboardResponse(response: DashboardResponse): DashboardData {
    return {
        merchant:      normalizeMerchant(response.merchant),
        trust:         normalizeTrust(response.trust),
        wallet:        normalizeWallet(response.wallet),
        opportunities: normalizeOpportunities(response.opportunities),
        notifications: normalizeNotifications(response.notifications),
        systemHealth:  normalizeSystemHealth(response.platform, response.timestamp),
        timestamp:     response.timestamp,
    };
}

export async function fetchDashboardData(): Promise<DashboardData> {
    try {
        const response = await dashboardApi.get();

        return {
            merchant:      normalizeMerchant(response.merchant),
            trust:         normalizeTrust(response.trust),
            wallet:        normalizeWallet(response.wallet),
            opportunities: normalizeOpportunities(response.opportunities),
            notifications: normalizeNotifications(response.notifications),
            systemHealth:  normalizeSystemHealth(response.platform, response.timestamp),
            timestamp:     response.timestamp,
        };
    } catch (err) {
        // Map global failure to all sections
        const { state, message } = mapGlobalErrorToState(err);
        const fallbackWidget: DashboardWidget<any> = { state, message, data: null };
        
        return {
            merchant: fallbackWidget,
            trust: fallbackWidget,
            wallet: fallbackWidget,
            opportunities: fallbackWidget,
            notifications: fallbackWidget,
            systemHealth: fallbackWidget,
            timestamp: new Date().toISOString(),
        };
    }
}
