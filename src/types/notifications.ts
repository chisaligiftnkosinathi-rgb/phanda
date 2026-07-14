/**
 * Notifications Type Definitions
 *
 * Types for push notifications, preferences, and notification history.
 */

/**
 * Device information for push notifications
 */
export interface DeviceInfo {
    device_id: string;
    platform: 'ios' | 'android' | 'web';
    push_token: string;
    app_version: string;
    os_version: string;
}

/**
 * Push token registration request
 */
export interface PushTokenRequest {
    token: string;
    platform: 'ios' | 'android' | 'web';
    app_version?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
    user_id: string;
    new_job: boolean;
    payment_received: boolean;
    proof_needed: boolean;
    payout_sent: boolean;
    trust_changed: boolean;
    marketing: boolean;
    updated_at: string;
}

/**
 * Notification preference update request
 */
export interface UpdatePreferencesRequest {
    new_job?: boolean;
    payment_received?: boolean;
    proof_needed?: boolean;
    payout_sent?: boolean;
    trust_changed?: boolean;
    marketing?: boolean;
}

/**
 * Single notification record
 */
export interface Notification {
    id: string;
    user_id: string;
    type: 'new_job' | 'payment_received' | 'proof_needed' | 'payout_sent' | 'trust_changed';
    title: string;
    body: string;
    data?: Record<string, unknown>;
    read: boolean;
    created_at: string;
    read_at?: string;
}

/**
 * Notification list response with pagination
 */
export interface NotificationList {
    notifications: Notification[];
    total_count: number;
    unread_count: number;
    limit: number;
    offset: number;
}

/**
 * Filter for notification queries
 */
export interface NotificationFilter {
    type?: 'new_job' | 'payment_received' | 'proof_needed' | 'payout_sent' | 'trust_changed' | 'all';
    read?: boolean | null; // null = all
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
}

/**
 * Request to mark notification as read
 */
export interface MarkReadRequest {
    notification_ids?: string[]; // if empty, mark all as read
}
