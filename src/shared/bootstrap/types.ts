// This is a temporary lightweight contract. 
// It will be replaced by the generated OpenAPI model once the backend implements /api/v1/bootstrap

import { Identity, Business, Permission, FeatureFlag, NavigationItem, PlatformRole } from '@/features/auth/types';
import { DashboardResponse } from '@/features/dashboard/types';

// We map it loosely to what the standard describes.
export interface BootstrapResponse {
    identity: Identity;
    businesses: Business[];
    selectedBusinessId: string | null;
    permissions: Permission[];
    featureFlags: FeatureFlag[];
    navigation: NavigationItem[];
    platformRole: PlatformRole;
    dashboard: DashboardResponse;
    policy: any; // Temporary
    system: {
        version: string;
        environment: string;
        maintenance: boolean;
    };
}
