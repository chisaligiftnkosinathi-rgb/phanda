import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useBootGate } from '@/state/useBootGate';
import { useAuthStore } from '@/features/auth';
import { useSession } from '@/features/auth';
import { healthApi } from '@/api/health';
import { setInterceptorQueryClient } from '@/shared/api/authInterceptor';

const queryClient = new QueryClient();
setInterceptorQueryClient(queryClient);

// Hold the native splash before any JS renders.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash prevention already acquired */
});

function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineTitle}>You're offline</Text>
      <Text style={styles.offlineText}>We can't reach the server right now.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Single BootGate UI coordinator.
 * Order: Handshake -> Auth Hydration -> (Router Rendering)
 */
function BootCoordinator({ children }: { children: React.ReactNode }) {
  const { apiReachable, setApiReachable, setAuthReady, systemReady } = useBootGate();
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const sessionState = useAuthStore((state) => state.sessionState);

  // Phase 1: Handshake
  const performHandshake = async () => {
    try {
      const result = await healthApi.handshake();
      setApiReachable(result.connected);
    } catch (e) {
      setApiReachable(false);
    }
  };

  useEffect(() => {
    performHandshake();
  }, []);

  // Phase 2: Auth Hydration
  useEffect(() => {
    if (apiReachable === true && !isHydrated) {
      hydrate();
    }
  }, [apiReachable, isHydrated]);

  // Phase 3: Convergence
  useEffect(() => {
    if (isHydrated && sessionState !== 'UNKNOWN' && sessionState !== 'HYDRATING') {
      setAuthReady(true);
    }
  }, [isHydrated, sessionState]);

  // Phase 4: Release Splash
  useEffect(() => {
    if (systemReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [systemReady]);

  if (apiReachable === false) {
    return <OfflineScreen onRetry={performHandshake} />;
  }

  // Only render the router once the system is ready (which implies Auth is resolved)
  if (!systemReady) {
    return null; // Keep splash screen visible
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <BootCoordinator>
        <Stack screenOptions={{ headerShown: false }} />
      </BootCoordinator>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  offlineText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});