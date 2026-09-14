import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { getStoredToken, clearStoredToken } from '@/utils/storage';
import { useGetBootstrapApiV1BootstrapGet, useReadinessCheckApiV1ReadyGet } from '@/generated/api';
import type { BootstrapResponse } from '@/generated/models/bootstrapResponse';

interface BootstrapContextType {
  isReady: boolean;
  isAuthenticated: boolean;
  bootstrapData: BootstrapResponse | null;
  refetchBootstrap: () => void;
}

const BootstrapContext = createContext<BootstrapContextType>({
  isReady: false,
  isAuthenticated: false,
  bootstrapData: null,
  refetchBootstrap: () => {},
});

export const BootstrapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // 1. Health & Readiness
  const { data: readyData, isError: isOffline } = useReadinessCheckApiV1ReadyGet({
    query: { retry: 2, staleTime: 30000 }
  });

  // 2. Initial token inspection from SecureStore
  useEffect(() => {
    async function inspectToken() {
      const token = await getStoredToken();
      setHasToken(!!token);
      setTokenChecked(true);
    }
    inspectToken();
  }, []);

  // 3. Consolidated Bootstrap Query (only enabled if token exists)
  const { 
    data: bootstrapData, 
    isLoading: isBootstrapLoading, 
    error: bootstrapError,
    refetch: refetchBootstrap 
  } = useGetBootstrapApiV1BootstrapGet({
    query: {
      enabled: hasToken && tokenChecked,
      retry: false,
    }
  });

  // 4. Handle 401 Unauthorized token expirations
  useEffect(() => {
    if (bootstrapError) {
      clearStoredToken().then(() => {
        setHasToken(false);
        router.replace('/(auth)/login');
      });
    }
  }, [bootstrapError]);

  // 5. Deterministic Routing Gateway
  useEffect(() => {
    if (!tokenChecked) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!hasToken && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (hasToken && bootstrapData) {
      const profile = bootstrapData.profile;
      
      if (!profile || !profile.onboarding_completed) {
        if (segments[0] !== 'onboarding') {
          router.replace('/onboarding');
        }
      } else if (inAuthGroup) {
        router.replace('/(steward)/tabs/manage');
      }
    }
  }, [hasToken, tokenChecked, bootstrapData, segments]);

  if (!tokenChecked || (hasToken && isBootstrapLoading)) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Initializing iPhande...</Text>
      </View>
    );
  }

  if (isOffline) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.errorTitle}>Service Temporarily Unavailable</Text>
        <Text style={styles.errorSubtitle}>Connecting to platform network...</Text>
      </View>
    );
  }

  return (
    <BootstrapContext.Provider 
      value={{ 
        isReady: true, 
        isAuthenticated: hasToken, 
        bootstrapData: bootstrapData || null, 
        refetchBootstrap 
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
};

export const useBootstrap = () => useContext(BootstrapContext);

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  errorTitle: {
    color: '#F87171',
    fontSize: 18,
    fontWeight: '700',
  },
  errorSubtitle: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
  },
});
