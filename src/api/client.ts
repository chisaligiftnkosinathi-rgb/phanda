import axios from 'axios';
import { ENV } from '../config/env';
import { storage } from '../utils/storage';

// Ensure baseURL ends with '/' so relative paths resolve correctly against it.
// Axios URL resolution: if baseURL='https://host/api/v1/' and url='auth/register'
// → resolves to 'https://host/api/v1/auth/register' ✅
// With a leading slash (url='/auth/register'), axios ignores the baseURL path → ❌
const rawBase = ENV.API_BASE_URL || 'https://iphande-production.up.railway.app';
const apiBase = rawBase.endsWith('/api/v1') || rawBase.endsWith('/api/v1/') 
    ? rawBase 
    : (rawBase.endsWith('/') ? rawBase + 'api/v1' : rawBase + '/api/v1');
const normalizedBase = apiBase.endsWith('/') ? apiBase : apiBase + '/';

export const apiClient = axios.create({
    baseURL: normalizedBase,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token automatically
apiClient.interceptors.request.use(async (config) => {
    const token = await storage.getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
