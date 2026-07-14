import axios, { AxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { storage } from '../utils/storage';
import { setupAuthInterceptor } from './authInterceptor';

const rawBase = ENV.API_BASE_URL || 'https://iphande-production.up.railway.app';
const normalizedBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

export const AXIOS_INSTANCE = axios.create({
  baseURL: normalizedBase,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupAuthInterceptor(AXIOS_INSTANCE);

// Custom instance for Orval to use
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
