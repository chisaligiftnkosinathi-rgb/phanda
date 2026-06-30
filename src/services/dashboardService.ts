/**
 * Dashboard Service
 *
 * Orchestrates all API calls needed for the dashboard.
 * Decouples the presentation layer from API complexity.
 *
 * Later: Replace all individual API calls with single
 *   GET /api/v1/dashboard
 * and this service won't change.
 */

import { dashboardApi } from '@/api/dashboard';
import { merchantApi } from '@/api/merchant';
import { notificationsApi } from '@/api/notifications';
import { trustApi } from '@/api/trust';

import type {
    DashboardData,
    DashboardErrorState,
    MerchantInfo,
    NotificationInfo,
    OpportunityInfo,
    SystemStatus,
    TrustInfo,
    WalletInfo,
} from '@/types/dashboard';

/**
 * Fetch merchant business info
 */
async function fetchMerchantInfo(): Promise<{ data: MerchantInfo | null; error?: string }> {
    try {
        const account = await merchantApi.getAccount();
        return {
            data: {
                id: account.id,
                account_holder_name: account.account_holder_name,
                verification_status: account.verification_status,
                payout_enabled: account.payout_enabled,
                created_at: account.created_at,
            },
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to load merchant info',
        };
    }
}

/**
 * Fetch trust score and visibility
 */
async function fetchTrustInfo(): Promise<{ data: TrustInfo | null; error?: string }> {
    try {
        const [score, visibility] = await Promise.all([
            trustApi.getTrustScore(),
            trustApi.getVisibilityStatus(),
        ]);

        return {
            data: {
                score,
                visibility,
                verification_required: score.overall_score < 50,
            },
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to load trust info',
        };
    }
}

/**
 * Fetch wallet summary
 */
async function fetchWalletInfo(): Promise<{ data: WalletInfo | null; error?: string }> {
    try {
        const dashboard = await dashboardApi.get();
        const wallet = dashboard.wallet;
        if (wallet.status !== 'ok' || !wallet.data) {
            return { data: null, error: wallet.error ?? 'Wallet unavailable' };
        }
        return {
            data: {
                pending_amount: wallet.data.pending_amount,
                available_amount: wallet.data.available_amount,
                paid_amount: wallet.data.paid_amount,
                currency: wallet.data.currency,
                last_updated: wallet.data.last_updated,
            },
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to load wallet info',
        };
    }
}

/**
 * Fetch current opportunities and job status
 * (Mock data for now - Chunk 6 will implement full opportunity flow)
 */
async function fetchOpportunityInfo(): Promise<{ data: OpportunityInfo | null; error?: string }> {
    try {
        // Placeholder - will be connected in Chunk 6
        return {
            data: {
                total_available: 0,
                active_jobs: 0,
                pending_proof_count: 0,
                completed_today: 0,
            },
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to load opportunities',
        };
    }
}

/**
 * Fetch notifications summary
 */
async function fetchNotificationInfo(): Promise<{ data: NotificationInfo | null; error?: string }> {
    try {
        const [notifications, unreadCount] = await Promise.all([
            notificationsApi.getNotifications({ limit: 5, read: false }),
            notificationsApi.getUnreadCount(),
        ]);

        const recent = notifications.notifications || [];
        const has_payment = recent.some((n) => n.type === 'payment_received');
        const has_proof = recent.some((n) => n.type === 'proof_needed');

        return {
            data: {
                total_unread: unreadCount.unread_count || 0,
                recent,
                has_unread_payment: has_payment,
                has_unread_proof: has_proof,
            },
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to load notifications',
        };
    }
}

/**
 * Fetch system health status
 */
async function fetchSystemStatus(): Promise<{ data: SystemStatus | null; error?: string }> {
    try {
        const health = await (analyticsApi as any).healthCheck?.();

        return {
            data: {
                status: health?.status || 'online',
                api_healthy: health?.api_healthy ?? true,
                last_sync: new Date().toISOString(),
                pending_sync_count: 0,
                sync_in_progress: false,
            },
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Health check failed',
        };
    }
}

/**
 * Assemble complete dashboard snapshot
 *
 * Fetches all required data in parallel.
 * Each piece's error does not prevent others from loading.
 *
 * @returns Complete DashboardData or null if no data available
 * @returns errors DashboardErrorState with per-section error messages
 */
export async function fetchDashboardData(): Promise<{
    data: DashboardData | null;
    errors: DashboardErrorState;
}> {
    // Fetch all sections in parallel
    const [merchantResult, trustResult, walletResult, opportunityResult, notificationResult, healthResult] =
        await Promise.all([
            fetchMerchantInfo(),
            fetchTrustInfo(),
            fetchWalletInfo(),
            fetchOpportunityInfo(),
            fetchNotificationInfo(),
            fetchSystemStatus(),
        ]);

    // Build error state
    const errors: DashboardErrorState = {};
    if (merchantResult.error) errors.merchant = merchantResult.error;
    if (trustResult.error) errors.trust = trustResult.error;
    if (walletResult.error) errors.wallet = walletResult.error;
    if (opportunityResult.error) errors.opportunities = opportunityResult.error;
    if (notificationResult.error) errors.notifications = notificationResult.error;
    if (healthResult.error) errors.systemHealth = healthResult.error;

    // Require at least some data to return a dashboard
    const hasAnyData =
        merchantResult.data ||
        trustResult.data ||
        walletResult.data ||
        opportunityResult.data ||
        notificationResult.data;

    if (!hasAnyData) {
        return { data: null, errors };
    }

    // Assemble dashboard with fallbacks for missing sections
    const dashboard: DashboardData = {
        merchant: merchantResult.data || {
            id: 'unknown',
            account_holder_name: 'Your Business',
            verification_status: 'unverified',
            payout_enabled: false,
            created_at: new Date().toISOString(),
        },
        trust: trustResult.data || {
            score: {
                user_id: 'unknown',
                overall_score: 0,
                verification_score: 0,
                completion_score: 0,
                visibility_score: 0,
                components: {
                    verified_profile: false,
                    verified_merchant_account: false,
                    successful_payments: 0,
                    successful_proofs: 0,
                    on_time_completion_rate: 0,
                },
                calculated_at: new Date().toISOString(),
            },
            visibility: {
                user_id: 'unknown',
                is_visible: false,
                visibility_reason: 'Account not verified',
                trust_level: 'new',
                visibility_percentage: 0,
            },
            verification_required: true,
        },
        wallet: walletResult.data || {
            pending_amount: '0.00',
            available_amount: '0.00',
            paid_amount: '0.00',
            currency: 'ZAR',
            last_updated: new Date().toISOString(),
        },
        opportunities: opportunityResult.data || {
            total_available: 0,
            active_jobs: 0,
            pending_proof_count: 0,
            completed_today: 0,
        },
        notifications: notificationResult.data || {
            total_unread: 0,
            recent: [],
            has_unread_payment: false,
            has_unread_proof: false,
        },
        systemHealth: healthResult.data || {
            status: 'degraded',
            api_healthy: false,
            last_sync: new Date().toISOString(),
            pending_sync_count: 0,
            sync_in_progress: false,
        },
        timestamp: new Date().toISOString(),
    };

    return { data: dashboard, errors };
}

// Placeholder for analytics API (will be imported when available)
const analyticsApi = {
    healthCheck: () => Promise.resolve({ status: 'online', api_healthy: true }),
};
