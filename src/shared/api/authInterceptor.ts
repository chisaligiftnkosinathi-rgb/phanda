import { AxiosInstance } from 'axios';
import { supabase } from '@/lib/supabase/client';

export const setupAuthInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(async (config) => {
    // Always read from Supabase — it is the source of truth for the JWT.
    // This ensures the token is valid even after a page refresh or token rotation.
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[AuthInterceptor] Could not get Supabase session:', err);
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.warn('[AuthInterceptor] 401 Unauthorized — token may be expired or missing.');
      }
      return Promise.reject(error);
    }
  );
};
