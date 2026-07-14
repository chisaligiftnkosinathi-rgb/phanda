import { useQuery } from '@tanstack/react-query';
import { bootstrapService } from './service';
import { fetchLegacyBootstrap } from './bootstrapMapper';
import { supabase } from '@/shared/api/supabase';

export const useBootstrapQuery = () => {
    return useQuery({
        queryKey: ['bootstrap'],
        queryFn: async () => {
            try {
                // Phase 2A: Attempt the real endpoint first
                return await bootstrapService.get();
            } catch (error: any) {
                // If it 404s or fails (backend not ready), gracefully fallback
                console.warn("Bootstrap endpoint not available, falling back to legacy flow.", error.message);
                
                const { data: { session } } = await supabase.auth.getSession();
                const email = session?.user?.email ?? "unknown@example.com";
                
                return await fetchLegacyBootstrap(email);
            }
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: false, // Don't aggressively retry if the endpoint is legitimately missing
    });
};
