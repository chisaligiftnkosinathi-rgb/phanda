import { useSession } from '@/features/auth/hooks/useAuth';
import { useAuthBridgeStore } from '@/state/useAuthBridgeStore';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

interface IntentContext {
  returnPath: string;
  label: string;
  [key: string]: any;
}

export function useRequireIdentity() {
  const { identity: user, permissions } = useSession();
  const { trigger } = useAuthBridgeStore();
  const router = useRouter();

  const requireIdentity = useCallback((action: () => void, context: IntentContext) => {
    if (user) {
      // User is already authenticated, execute the intent immediately
      action();
    } else {
      // Pause intent, fire up the bridge
      trigger({
        run: action,
        context,
        returnPath: context.returnPath,
        label: context.label,
      });
      router.push('/(auth)/bridge');
    }
  }, [user, trigger, router]);

  return requireIdentity;
}
