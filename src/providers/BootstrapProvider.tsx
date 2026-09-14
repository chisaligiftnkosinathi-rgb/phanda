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

  // 5. Deterministic Routing Gateway: Enforce Login/Signup FIRST
  useEffect(() => {
    if (!tokenChecked) return;

    const topSegment = segments[0] as string | undefined;
    const isAuthRoute = topSegment === '(auth)' || topSegment === 'login' || topSegment === 'register';

    // Rule 1: No token? You MUST login or sign up first. Onboarding is blocked without an account.
    if (!hasToken) {
      if (!isAuthRoute) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Rule 2: Has token, check onboarding state
    if (hasToken && bootstrapData) {
      const profile = bootstrapData.profile;
      
      if (!profile || !profile.onboarding_completed) {
        if (topSegment !== 'onboarding' && topSegment !== '(auth)') {
          router.replace('/onboarding');
        }
      } else if (isAuthRoute) {
        router.replace('/(steward)/dashboard');
      }
    }
  }, [hasToken, tokenChecked, bootstrapData, segments]);

  if (!tokenChecked || (hasToken && isBootstrapLoading)) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.brandGroup}>
          <Text style={styles.brandTitle}>iPhande</Text>
          <Text style={styles.brandTagline}>Township Enterprise ERP & Steward Operating System</Text>
        </View>

        <View style={styles.loaderGroup}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Connecting to Trust Ledger...</Text>
        </View>

        <View style={styles.footerGroup}>
          <Text style={styles.footerPillars}>Visibility • Opportunity • Continuity</Text>
        </View>
      </View>
    );
  }

  if (isOffline) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.brandGroup}>
          <Text style={styles.brandTitle}>iPhande</Text>
        </View>
        <Text style={styles.errorTitle}>Network Connection Required</Text>
        <Text style={styles.errorSubtitle}>Attempting to reach the platform network...</Text>
        <ActivityIndicator size="small" color="#F87171" style={{ marginTop: 24 }} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0F1D',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  brandGroup: {
    alignItems: 'center',
    marginTop: 80,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  brandTagline: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  loaderGroup: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footerGroup: {
    alignItems: 'center',
  },
  footerPillars: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  errorTitle: {
    color: '#F87171',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 32,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
