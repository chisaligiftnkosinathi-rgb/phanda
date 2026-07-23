/**
 * Health API Module
 *
 * Phase 1 — Connectivity
 * Proves: Phone → Internet → Railway → API
 *
 * Use at app startup to verify the backend is reachable before
 * attempting auth or data loading.
 */

import { apiClient } from './client';

export interface HealthCheckResult {
    status: 'alive' | 'degraded' | 'unreachable';
    app?: string;
    version?: string;
    environment?: string;
    latency_ms?: number;
}

export interface ReadinessResult {
    ready: boolean;
    status: 'ok' | 'starting';
    immutability?: 'active' | 'initializing';
}

export interface HandshakeResult {
    connected: boolean;
    latency_ms?: number;
    api_version?: string;
    deployment?: string;
    maintenance?: boolean;
    minimum_mobile_version?: string;
    recommended_mobile_version?: string;
    features?: {
        payments?: boolean;
        inventory?: boolean;
        telemetry?: boolean;
    };
}

export const healthApi = {
    /**
     * GET /health
     * Liveness probe — is the Railway container alive?
     * Call this first on app startup.
     */
    check: async (): Promise<HealthCheckResult> => {
        const start = Date.now();
        const response = await apiClient.get('../../health'); // relative to base /api/v1
        return {
            ...response.data,
            latency_ms: Date.now() - start,
        };
    },

    /**
     * GET /api/v1/ready
     * Financial system readiness — are payment systems initialized?
     * Returns ready=false during cold starts (normal on Railway).
     */
    ready: async (): Promise<ReadinessResult> => {
        const response = await apiClient.get('ready');
        return response.data;
    },

    /**
     * GET /api/v1/mobile/handshake
     * Mobile-specific handshake to validate connectivity.
     * Proves the full path from app → Railway → database.
     */
    handshake: async (): Promise<HandshakeResult> => {
        const start = Date.now();
        const response = await apiClient.get('mobile/handshake');
        return {
            connected: true,
            latency_ms: Date.now() - start,
            ...response.data,
        };
    },

    /**
     * GET /api/v1/health/dashboard
     * Service readiness for dashboard data (DB, cache, etc.).
     * Use to show diagnostic info when dashboard fails to load.
     */
    dashboardHealth: async () => {
        const response = await apiClient.get('health/dashboard');
        return response.data;
    },

    /**
     * Convenience: run all Phase 1 connectivity checks
     * Returns a summary of connectivity status.
     */
    runConnectivityCheck: async (): Promise<{
        liveness: HealthCheckResult;
        handshake: HandshakeResult;
        allPassed: boolean;
    }> => {
        const [liveness, handshake] = await Promise.allSettled([
            healthApi.check(),
            healthApi.handshake(),
        ]);

        const livenessResult: HealthCheckResult =
            liveness.status === 'fulfilled'
                ? liveness.value
                : { status: 'unreachable' };

        const handshakeResult: HandshakeResult =
            handshake.status === 'fulfilled'
                ? handshake.value
                : { connected: false };

        return {
            liveness: livenessResult,
            handshake: handshakeResult,
            allPassed:
                livenessResult.status === 'alive' && handshakeResult.connected,
        };
    },
};
