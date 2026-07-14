import { createClient } from '@supabase/supabase-js';
import { storage } from '../utils/storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const storageAdapter = {
    getItem: async (key: string) => {
        return await storage.getToken();
    },
    setItem: async (key: string, value: string) => {
        await storage.setToken(value);
    },
    removeItem: async (key: string) => {
        await storage.removeToken();
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
