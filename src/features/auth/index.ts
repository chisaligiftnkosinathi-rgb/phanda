// Public barrel export for the Auth feature
export { useAuth, useSession } from './hooks/useAuth';
export { useAuthStore } from './store/useAuthStore';
export type {
  Identity,
  UserRole,
  PlatformRole,
  PlanCode,
  Permission,
  FeatureFlag,
  Business,
  NavigationItem,
  SessionContext,
} from './types';
