
import { BootstrapResponse } from './types';
import { Permission, FeatureFlag, PlanCode } from '@/features/auth/types';
import { supabase } from '@/api/supabase';

/**
 * Temporarily constructs a BootstrapResponse using the legacy /profiles/me endpoint.
 * This will be removed in Phase 2B once the backend provides /api/v1/bootstrap.
 */
export const fetchLegacyBootstrap = async (email: string): Promise<BootstrapResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || '';

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    // Very basic fallback values
    return {
        identity: {
            id: profile?.id || userId, // using profile id as proxy for now
            email: email,
            emailVerified: true
        },
        businesses: [{
            id: profile?.id || userId,
            slug: profile?.slug || '',
            displayName: profile?.full_name || '',
            trust: 100,
            plan: PlanCode.FREE,
            status: "active",
            permissions: [],
            featureFlags: []
        }],
        selectedBusinessId: profile?.id || userId,
        permissions: [] as Permission[],
        featureFlags: [] as FeatureFlag[],
        navigation: [],
        platformRole: "steward",
        dashboard: {
            trust: {
                score: 100,
                level: 'verified',
                nextMilestone: 'expert'
            },
            wallet: {
                balance: 0,
                currency: 'ZAR',
                pendingPayouts: 0
            },
            notifications: {
                unreadCount: 0,
                latestMessage: null
            },
            work: {
                activeLeads: 0,
                openOpportunities: 0,
                recentProofUploads: 0
            },
            system: {
                driftScore: 0,
                activeProfiles: 0,
                pendingReviews: 0,
                dampingAction: 'none'
            }
        },
        policy: {},
        system: {
            version: "0.1.0-legacy",
            environment: "development",
            maintenance: false
        }
    };
};
