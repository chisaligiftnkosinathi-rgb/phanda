import { Business } from '@/features/auth/types';
import { DashboardResponse, DashboardViewModel, WidgetState, WidgetProps } from '../types';

export function mapDashboardResponseToViewModel(
    response: DashboardResponse | null | undefined,
    state: WidgetState,
    businessContext: Business | null,
    error: Error | null = null
): DashboardViewModel {
    const timestamp = new Date().toISOString();
    const errorMsg = error ? error.message : null;

    const createWidgetProps = <T>(data: T | undefined): WidgetProps<T> => {
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

    return {
        trust: createWidgetProps(response?.trust),
        wallet: createWidgetProps(response?.wallet),
        work: createWidgetProps(response?.work),
        notifications: createWidgetProps(response?.notifications),
        system: createWidgetProps(response?.system),
        businessContext,
    };
}
