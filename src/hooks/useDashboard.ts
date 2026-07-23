/**
 * useDashboard Hook
 *
 * Custom hook for dashboard data fetching using React Query.
 *
 * Data dependency:
 *   Dashboard uses bootstrap.dashboard as placeholder data to ensure instant
 *   rendering without flashing empty states.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData, normalizeDashboardResponse } from '@/services/dashboardService';
import { useSession } from '@/features/auth/hooks/useAuth';
import type { DashboardData } from '@/types/dashboard';

export function useDashboard() {
    const { authenticated, identity, dashboardSnapshot } = useSession();

    const query = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboardData,
        enabled: authenticated && !!identity,
        placeholderData: () => {
            if (dashboardSnapshot) {
                return normalizeDashboardResponse(dashboardSnapshot);
            }
            return undefined;
        },
        // React Query config requested by the user
        staleTime: 60 * 1000,           // 60 seconds
        gcTime: 10 * 60 * 1000,         // 10 minutes
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        // The user specifically requested false for refetchInterval (no polling)
        refetchInterval: false,
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        isRefetching: query.isRefetching,
        refetch: query.refetch,
        error: query.error,
    };
}
