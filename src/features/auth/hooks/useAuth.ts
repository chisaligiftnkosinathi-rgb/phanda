import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { UserLogin, UserCreate } from '@/generated/models';
import { useBootstrapQuery } from '@/shared/bootstrap/useBootstrap';
import { supabase } from '@/shared/api/supabase';
import { SessionContext } from '../types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);
  const storeLogout = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: async (credentials: UserLogin) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data.session) {
        await setTokens(data.session.access_token, data.session.refresh_token);
        queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: UserCreate) => {
        const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw error;
        return data;
    },
    onSuccess: async (data) => {
      if (data.session) {
        await setTokens(data.session.access_token, data.session.refresh_token);
        queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      }
    },
  });

  const logout = async () => {
    await supabase.auth.signOut();
    await storeLogout();
    queryClient.clear();
  };

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};

export const useSession = (): SessionContext => {
  const { accessToken, isHydrated, selectedBusinessId, setSelectedBusinessId } = useAuthStore();
  const queryClient = useQueryClient();
  
  const isAuthenticated = !!accessToken;

  // useSession acts as a strict Facade over the bootstrap query
  const { data: bootstrap, isLoading, error } = useBootstrapQuery();

  const identity = isAuthenticated && bootstrap?.identity ? bootstrap.identity : null;
  const businesses = isAuthenticated && bootstrap?.businesses ? bootstrap.businesses : [];
  
  // Resolve the selected business
  let selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || null;
  if (!selectedBusiness && businesses.length > 0) {
      selectedBusiness = businesses[0];
  }

  const permissions = isAuthenticated ? (bootstrap?.permissions || []) : [];
  const featureFlags = isAuthenticated ? (bootstrap?.featureFlags || []) : [];
  const navigation = isAuthenticated ? (bootstrap?.navigation || []) : [];
  const platformRole = isAuthenticated && bootstrap?.platformRole ? bootstrap.platformRole : "guest";
  const dashboardSnapshot = isAuthenticated && bootstrap?.dashboard ? bootstrap.dashboard : null;

  const can = (resource: string, action: string) => {
      return permissions.some(p => p.resource === resource && p.action === action);
  };

  const switchBusiness = (id: string) => {
      setSelectedBusinessId(id);
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    identity,
    businesses,
    selectedBusiness,
    permissions,
    featureFlags,
    navigation,
    platformRole,
    dashboardSnapshot,
    authenticated: isAuthenticated,
    hydrated: isHydrated,
    loading: isLoading,
    can,
    switchBusiness
  };
};
