import { Business } from '@/features/auth/types';
import { DashboardViewModel, WidgetState, WidgetProps } from '../types';
import { DashboardResponse } from '@/generated/models';
import { TrustWidgetData, WalletWidgetData, WorkWidgetData, NotificationWidgetData, SystemWidgetData } from '../types';

export function mapDashboardResponseToViewModel(
    response: DashboardResponse | null | undefined,
    state: WidgetState,
    businessContext: Business | null,
    error: Error | null = null
): DashboardViewModel {
    const timestamp = new Date().toISOString();
    const errorMsg = error ? error.message : null;

    const createWidgetProps = <T,>(data: T | undefined): WidgetProps<T> => {
        if (!data && state !== 'unavailable' && state !== 'maintenance') {
            return {
                state: 'unavailable',
                data: null,
                lastUpdated: timestamp,
                error: 'Data unavailable',
            };
        }
        return {
            state,
            data: data || null,
            lastUpdated: timestamp,
            error: errorMsg,
        };
    };

    let trustData: TrustWidgetData | undefined;
    if (response?.trust?.data) {
        trustData = {
            score: response.trust.data.score?.overall_score || 0,
            level: response.trust.data.score?.overall_score >= 70 ? 'High Trust' : 'Building Trust',
            nextMilestone: 'Upload proof of work',
        };
    }

    let walletData: WalletWidgetData | undefined;
    if (response?.wallet?.data) {
        walletData = {
            balance: parseFloat(response.wallet.data.available_amount || '0'),
            currency: response.wallet.data.currency || 'ZAR',
            pendingPayouts: parseFloat(response.wallet.data.pending_amount || '0'),
        };
    }

    let workData: WorkWidgetData | undefined;
    if (response?.opportunities?.data) {
        workData = {
            activeLeads: response.opportunities.data.active_jobs || 0,
            openOpportunities: response.opportunities.data.total_available || 0,
            recentProofUploads: response.opportunities.data.completed_today || 0,
        };
    }

    let notificationsData: NotificationWidgetData | undefined;
    if (response?.notifications?.data) {
        notificationsData = {
            unreadCount: response.notifications.data.total_unread || 0,
            latestMessage: response.notifications.data.has_unread_payment ? 'Unread payment' : null,
        };
    }

    let systemData: SystemWidgetData | undefined;
    if (response?.platform?.data) {
        systemData = {
            driftScore: 0,
            activeProfiles: 0,
            pendingReviews: 0,
            dampingAction: response.platform.data.maintenance ? 'maintenance mode' : 'none',
        };
    }

    return {
        trust: createWidgetProps(trustData),
        wallet: createWidgetProps(walletData),
        work: createWidgetProps(workData),
        notifications: createWidgetProps(notificationsData),
        system: createWidgetProps(systemData),
        businessContext,
    };
}
