import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { UserLogin, UserCreate } from '@/generated/models';
import { useBootstrapQuery } from '@/shared/bootstrap/useBootstrap';
import { supabase } from '@/lib/supabase/client';
import { SessionContext, Business, Permission, FeatureFlag, NavigationItem, PlatformRole } from '../types';
import { useBootGate } from '@/state/useBootGate';

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
  const { sessionState, isHydrated, selectedBusinessId, setSelectedBusinessId } = useAuthStore();
  const apiReachable = useBootGate((state) => state.apiReachable);
  const queryClient = useQueryClient();
  
  const isAuthenticated = sessionState === 'AUTHENTICATED';
  const shouldFetchBootstrap = isHydrated && isAuthenticated && apiReachable === true;

  // useSession acts as a strict Facade over the bootstrap query
  const { data: bootstrap, isLoading, error } = useBootstrapQuery(shouldFetchBootstrap);

  const identity = isAuthenticated && bootstrap?.identity ? bootstrap.identity : null;
  const businesses = isAuthenticated && bootstrap?.businesses ? (bootstrap.businesses as unknown as Business[]) : [];
  
  // Resolve the selected business
  let selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || null;
  if (!selectedBusiness && businesses.length > 0) {
      selectedBusiness = businesses[0];
  }

  const application = isAuthenticated && bootstrap?.application ? bootstrap.application : null;
  const setup = isAuthenticated && bootstrap?.setup ? bootstrap.setup : null;
  const subscription = isAuthenticated && bootstrap?.subscription ? bootstrap.subscription : null;
  const workspace = isAuthenticated && bootstrap?.workspace ? bootstrap.workspace : null;

  const permissions = isAuthenticated ? (bootstrap?.permissions as unknown as Permission[] || []) : [];
  const featureFlags = isAuthenticated ? (bootstrap?.featureFlags as unknown as FeatureFlag[] || []) : [];
  const navigation = isAuthenticated ? (bootstrap?.navigation as unknown as NavigationItem[] || []) : [];
  const platformRole = isAuthenticated && bootstrap?.platformRole ? (bootstrap.platformRole as unknown as PlatformRole) : "guest";
  const dashboardSnapshot = isAuthenticated && bootstrap?.dashboard ? bootstrap.dashboard : null;

  const can = (resource: string, action: string) => {
      return permissions.some((p: any) => p === `${resource}:${action}` || (p.resource === resource && p.action === action));
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
    application,
    setup,
    subscription,
    workspace,
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
