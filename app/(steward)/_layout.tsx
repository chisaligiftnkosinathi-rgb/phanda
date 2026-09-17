import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore, useSession } from '@/features/auth';

export default function StewardLayout() {
  const router = useRouter();
  const segments = useSegments();
  const sessionState = useAuthStore((state) => state.sessionState);
  const { application, loading } = useSession();

  useEffect(() => {
    if (loading) return;

    // If the token expires or the user logs out, eject them from the protected area
    if (sessionState === 'UNAUTHENTICATED') {
      router.replace('/(auth)/auth/login');
      return;
    }

    // Handle Application Stage Routing
    if (application?.stage) {
      const inSetup = (segments as string[]).includes('setup');
      
      if (application.stage === 'ONBOARDING' && !inSetup) {
        router.replace('/(steward)/setup');
      } else if (application.stage === 'ACTIVE' && inSetup) {
        router.replace('/(steward)/tabs/home');
      }
    }
  }, [sessionState, application?.stage, loading, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
