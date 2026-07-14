import { AxiosInstance } from 'axios';
import { storage } from '../utils/storage';

export const setupAuthInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(async (config) => {
    // Attempt to get token
    const token = await storage.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle 401 Unauthorized globally if needed (e.g., refresh token or clear state)
      if (error.response?.status === 401) {
        // Emit event or clear storage
        console.warn('Unauthorized. Token might be expired.');
      }
      return Promise.reject(error);
    }
  );
};
