/**
 * Analytics API Module
 *
 * Event tracking, error reporting, and health check endpoints.
 */

import { apiClient } from './client';

/**
 * Analytics event record
 */
export interface AnalyticsEvent {
    event_name: string;
    properties?: Record<string, unknown>;
    timestamp?: string;
}

/**
 * Error report structure
 */
export interface ErrorReport {
    error_message: string;
    error_stack?: string;
    screen?: string;
    properties?: Record<string, unknown>;
    timestamp?: string;
}

/**
 * Session metrics summary
 */
export interface SessionMetrics {
    session_duration_seconds: number;
    screen_count: number;
    api_calls: number;
    errors: number;
    timestamp: string;
}

/**
 * Health check response
 */
export interface HealthCheck {
    status: 'ok' | 'degraded' | 'error';
    api_healthy: boolean;
    database_healthy: boolean;
    timestamp: string;
}

export const analyticsApi = {
    /**
     * Log analytics event
     */
    logEvent: async (event: AnalyticsEvent): Promise<{ success: boolean }> => {
        const response = await apiClient.post('/analytics/events', {
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        });
        return response.data;
    },

    /**
     * Log batch analytics events
     */
    logBatchEvents: async (events: AnalyticsEvent[]): Promise<{ logged_count: number }> => {
        const enriched = events.map((e) => ({
            ...e,
            timestamp: e.timestamp || new Date().toISOString(),
        }));
        const response = await apiClient.post('/analytics/events/batch', { events: enriched });
        return response.data;
    },

    /**
     * Report error to backend
     */
    reportError: async (error: ErrorReport): Promise<{ error_id: string }> => {
        const response = await apiClient.post('/analytics/errors', {
            ...error,
            timestamp: error.timestamp || new Date().toISOString(),
        });
        return response.data;
    },

    /**
     * Report batch errors
     */
    reportBatchErrors: async (errors: ErrorReport[]): Promise<{ reported_count: number }> => {
        const enriched = errors.map((e) => ({
            ...e,
            timestamp: e.timestamp || new Date().toISOString(),
        }));
        const response = await apiClient.post('/analytics/errors/batch', { errors: enriched });
        return response.data;
    },

    /**
     * Get session metrics
     */
    getMetrics: async (): Promise<SessionMetrics> => {
        const response = await apiClient.get('/analytics/metrics');
        return response.data;
    },

    /**
     * Health check endpoint
     */
    healthCheck: async (): Promise<HealthCheck> => {
        const response = await apiClient.get('/analytics/health');
        return response.data;
    },

    /**
     * Report app performance metrics
     */
    reportPerformance: async (metrics: Record<string, unknown>): Promise<{ success: boolean }> => {
        const response = await apiClient.post('/analytics/performance', metrics);
        return response.data;
    },
};
