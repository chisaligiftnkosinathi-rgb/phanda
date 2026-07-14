import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useBootGate } from '@/state/useBootGate';
import { useAuthStore } from '@/features/auth';
import { useSession } from '@/features/auth';

const queryClient = new QueryClient();

// Hold the native splash before any JS renders.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash prevention already acquired */
});

/**
 * Bootstrapper to hydrate auth state and manage system ready
 */
function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  // This will also fire the me request if authenticated
  const { loading } = useSession();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated) {
      useBootGate.getState().setAuthReady(true);
    }
  }, [isHydrated]);

  return <>{children}</>;
}

function RootNavigator() {
  const systemReady = useBootGate((state) => state.systemReady);

  useEffect(() => {
    let isMounted = true;

    if (systemReady) {
      // Both auth and kernel have converged — the system is alive.
      SplashScreen.hideAsync().catch((err) => {
        if (isMounted) {
          console.warn('Failed to hide splash screen:', err);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [systemReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        
          <RootNavigator />
        
      </AuthHydrator>
    </QueryClientProvider>
  );
}