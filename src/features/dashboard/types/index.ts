import { Business } from '@/features/auth/types';

export type WidgetState = "snapshot" | "live" | "refreshing" | "unavailable" | "maintenance";

export interface WidgetProps<T> {
    state: WidgetState;
    data: T | null;
    lastUpdated: string | null;
    error: string | null;
}

export interface TrustWidgetData {
    score: number;
    level: string;
    nextMilestone: string;
}

export interface WalletWidgetData {
    balance: number;
    currency: string;
    pendingPayouts: number;
}

export interface WorkWidgetData {
    activeLeads: number;
    openOpportunities: number;
    recentProofUploads: number;
}

export interface NotificationWidgetData {
    unreadCount: number;
    latestMessage: string | null;
}

export interface SystemWidgetData {
    driftScore?: number;
    activeProfiles?: number;
    pendingReviews?: number;
    dampingAction?: string;
}

export interface DashboardViewModel {
    trust: WidgetProps<TrustWidgetData>;
    wallet: WidgetProps<WalletWidgetData>;
    work: WidgetProps<WorkWidgetData>;
    notifications: WidgetProps<NotificationWidgetData>;
    system: WidgetProps<SystemWidgetData>;
    businessContext: Business | null;
}

// Minimal DTO interfaces representing the expected /api/v1/dashboard payload
export interface LegacyDashboardResponse {
    trust?: TrustWidgetData;
    wallet?: WalletWidgetData;
    work?: WorkWidgetData;
    notifications?: NotificationWidgetData;
    system?: SystemWidgetData;
}
