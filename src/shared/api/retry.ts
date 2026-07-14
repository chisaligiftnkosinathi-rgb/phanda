import { AxiosError } from 'axios';

// Basic retry configuration for React Query
export const queryRetryLogic = (failureCount: number, error: unknown) => {
  // Don't retry on 401 Unauthorized or 403 Forbidden or 404 Not Found
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401 || 
        axiosError.response?.status === 403 ||
        axiosError.response?.status === 404) {
      return false;
    }
  }
  
  // Retry up to 3 times for other errors
  return failureCount < 3;
};
