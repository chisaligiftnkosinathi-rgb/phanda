import { supabase } from '@/lib/supabase/client';

/* ---------------------------------------------------
   BASE CONFIG
--------------------------------------------------- */

const RAW_API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL =
    RAW_API_URL ?? 'https://iphande-production.up.railway.app';

if (!RAW_API_URL) {
    console.warn(
        '⚠️ EXPO_PUBLIC_API_BASE_URL missing — using fallback API base URL'
    );
}

/* ---------------------------------------------------
   ENDPOINT ALIAS & FALLBACK MAP
--------------------------------------------------- */

const ENDPOINT_FALLBACKS: Record<string, string[]> = {
    '/work': ['/opportunities', '/gateway/work', '/public/work'],
    '/people': ['/stewards', '/gateway/people', '/public/people'],
};

/* ---------------------------------------------------
   TOKEN CACHE (SAFE + CONSISTENT)
--------------------------------------------------- */

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getToken(): Promise<string | null> {
    const { useAuthStore } = require('@/features/auth/store/useAuthStore');
    return useAuthStore.getState().accessToken || null;
}

/* ---------------------------------------------------
   TIMEOUT WRAPPER
--------------------------------------------------- */

function withTimeout<T>(promise: Promise<T>, timeout = 15000): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('API Timeout: request exceeded 15s'));
        }, timeout);

        promise
            .then((res) => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

/* ---------------------------------------------------
   RETRY LAYER (IMPORTANT FOR MOBILE NETWORKS)
--------------------------------------------------- */

async function retryFetch(
    url: string,
    options: RequestInit,
    retries = 2
): Promise<Response> {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (retries <= 0) throw err;
        return retryFetch(url, options, retries - 1);
    }
}

/* ---------------------------------------------------
   MAIN FETCH WRAPPER WITH ENDPOINT FALLBACKS
--------------------------------------------------- */

export async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = await getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    const attemptFetch = async (targetEndpoint: string): Promise<Response> => {
        const url = `${API_BASE_URL}${targetEndpoint}`;
        console.log(`[API] → ${targetEndpoint}`);
        const request = retryFetch(url, { ...options, headers });
        return await withTimeout(request);
    };

    let response = await attemptFetch(endpoint);

    // Fallback logic for 404s on legacy or alias endpoints (e.g. /work -> /opportunities)
    if (response.status === 404 && ENDPOINT_FALLBACKS[endpoint]) {
        for (const fallbackEndpoint of ENDPOINT_FALLBACKS[endpoint]) {
            console.warn(`[API] 404 on ${endpoint} — attempting fallback: ${fallbackEndpoint}`);
            const fallbackResponse = await attemptFetch(fallbackEndpoint);
            if (fallbackResponse.ok) {
                response = fallbackResponse;
                break;
            }
        }
    }

    if (!response.ok) {
        let message = 'Unknown API error';

        try {
            message = await response.text();
        } catch { /* fall through */ }

        throw {
            status: response.status,
            endpoint,
            message,
        };
    }

    return response.json();
}