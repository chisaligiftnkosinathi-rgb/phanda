import { create } from 'zustand';
import { storage } from '@/shared/utils/storage';

interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  
  // UI Presentation Context
  selectedBusinessId?: string;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  widgetVisibility: Record<string, boolean>;
  timelinePresentation: 'list' | 'grid' | 'compact';

  isHydrated: boolean;

  // Actions
  setTokens: (access?: string, refresh?: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  
  // UI Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedBusinessId: (id?: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  theme: 'system',
  sidebarOpen: true,
  widgetVisibility: {},
  timelinePresentation: 'list',
  isHydrated: false,

  setTokens: async (access?: string, refresh?: string) => {
    if (access) await storage.setToken(access);
    else await storage.removeToken();
    set({ accessToken: access, refreshToken: refresh });
  },

  logout: async () => {
    await storage.removeToken();
    set({ 
        accessToken: undefined, 
        refreshToken: undefined, 
        selectedBusinessId: undefined 
    });
  },

  hydrate: async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        set({ accessToken: token, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('Failed to hydrate auth state:', error);
      set({ isHydrated: true });
    }
  },

  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedBusinessId: (selectedBusinessId) => set({ selectedBusinessId }),
}));
