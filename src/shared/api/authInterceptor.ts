import { AxiosInstance } from 'axios';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { QueryClient } from '@tanstack/react-query';

// We need access to the query client to clear caches
let globalQueryClient: QueryClient | null = null;
export const setInterceptorQueryClient = (client: QueryClient) => {
  globalQueryClient = client;
};

export const setupAuthInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(async (config) => {
    try {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (err) {
      console.warn('[AuthInterceptor] Could not get token from store:', err);
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.warn('[AuthInterceptor] 401 Unauthorized — token may be expired or missing. Triggering clean logout sequence.');
        // Clear token and transition state
        await useAuthStore.getState().logout();
        
        // Clear query cache to remove protected data
        if (globalQueryClient) {
            globalQueryClient.clear();
        }
      }
      return Promise.reject(error);
    }
  );
};
