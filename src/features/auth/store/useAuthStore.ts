import { create } from 'zustand';
import { storage } from '@/shared/utils/storage';

export type SessionState = 'UNKNOWN' | 'HYDRATING' | 'AUTHENTICATED' | 'UNAUTHENTICATED';

interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  
  // UI Presentation Context
  selectedBusinessId?: string;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  widgetVisibility: Record<string, boolean>;
  timelinePresentation: 'list' | 'grid' | 'compact';

  sessionState: SessionState;
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
  sessionState: 'UNKNOWN',
  isHydrated: false,

  setTokens: async (access?: string, refresh?: string) => {
    if (access) await storage.setToken(access);
    else await storage.removeToken();
    set({ 
      accessToken: access, 
      refreshToken: refresh,
      sessionState: access ? 'AUTHENTICATED' : 'UNAUTHENTICATED'
    });
  },

  logout: async () => {
    await storage.removeToken();
    set({ 
        accessToken: undefined, 
        refreshToken: undefined, 
        selectedBusinessId: undefined,
        sessionState: 'UNAUTHENTICATED'
    });
  },

  hydrate: async () => {
    set({ sessionState: 'HYDRATING' });
    try {
      const token = await storage.getToken();
      if (token) {
        set({ accessToken: token, isHydrated: true, sessionState: 'AUTHENTICATED' });
      } else {
        set({ isHydrated: true, sessionState: 'UNAUTHENTICATED' });
      }
    } catch (error) {
      console.error('Failed to hydrate auth state:', error);
      set({ isHydrated: true, sessionState: 'UNAUTHENTICATED' });
    }
  },

  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedBusinessId: (selectedBusinessId) => set({ selectedBusinessId }),
}));
