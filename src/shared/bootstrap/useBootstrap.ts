import { useGetBootstrapApiV1BootstrapGet } from '@/generated/api';
import { supabase } from '@/lib/supabase/client';

export const useBootstrapQuery = (enabled: boolean) => {
    return useGetBootstrapApiV1BootstrapGet({
        query: {
            staleTime: 1000 * 60 * 5, // Cache for 5 minutes
            retry: false,
            enabled
        }
    });
};
