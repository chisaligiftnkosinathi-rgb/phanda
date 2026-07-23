import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardApiV1DashboardGet } from '@/generated/api';
import { DashboardViewModel } from '../types';
import { mapDashboardResponseToViewModel } from '../mappers/dashboardMapper';
import { useSession } from '@/features/auth/hooks/useAuth';
import { BootstrapResponse, DashboardResponse } from '@/generated/models';

export const useDashboardQuery = () => {
    const session = useSession();
    // Assuming session exposes profile currently instead of businesses until fully migrated
    const activeBusiness = session.selectedBusiness || null;
    const queryClient = useQueryClient();

    // 1. Get snapshot from Bootstrap payload
    const bootstrapPayload = queryClient.getQueryData<BootstrapResponse>(['bootstrap']);
    const snapshot = bootstrapPayload?.dashboard;

    // 2. Query Live Dashboard
    const query = useQuery<DashboardResponse, Error, DashboardViewModel>({
        queryKey: ['dashboard'],
        queryFn: () => getDashboardApiV1DashboardGet() as unknown as Promise<DashboardResponse>,
        enabled: session.authenticated && !!session.identity,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false, // Don't aggressively retry on 404, fallback to snapshot quickly
        select: (data) => mapDashboardResponseToViewModel(data, 'live', activeBusiness),
    });

    // 3. Fallback logic
    if (query.isError) {
        // Render snapshot if available
        if (snapshot) {
            return {
                ...query,
                data: mapDashboardResponseToViewModel(snapshot, 'snapshot', activeBusiness, query.error),
            };
        }
        
        // Otherwise total failure
        return {
            ...query,
            data: mapDashboardResponseToViewModel(null, 'unavailable', activeBusiness, query.error),
        };
    }

    if (query.isLoading) {
        if (snapshot) {
             return {
                ...query,
                data: mapDashboardResponseToViewModel(snapshot, 'snapshot', activeBusiness),
            };
        }
        
        return {
            ...query,
            data: mapDashboardResponseToViewModel(null, 'refreshing', activeBusiness),
        };
    }

    // Default return
    return query;
};

export const useRefreshDashboard = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};
