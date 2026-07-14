export interface Identity {
  id: string;              // Supabase Auth UID
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

export enum UserRole {
  GUEST = "guest",
  STEWARD = "steward",
  VERIFIED_BUSINESS = "verified_business",
  MODERATOR = "moderator",
  ADMIN = "admin",
  SYSTEM_CREATOR = "system_creator",
}

export type PlatformRole = "owner" | "admin" | "moderator" | "steward" | "guest";

export enum PlanCode {
  FREE = "free",
  STARTER = "starter",
  GROWTH = "growth",
  BUSINESS = "business",
  ENTERPRISE = "enterprise"
}

export interface Permission {
  resource: string;
  action: string;
  scope?: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  version: string;
  rollout: number;
  configuration: Record<string, unknown>;
}

export interface Business {
  id: string;
  slug: string;
  displayName: string;
  trust: number;
  plan: PlanCode;
  status: string;
  setup_fee_status?: string;
  setup_fee_proof_url?: string;
  permissions: Permission[];
  featureFlags: FeatureFlag[];
}

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  badge?: number;
}

export interface SessionContext {
    identity: Identity | null;
    businesses: Business[];
    selectedBusiness: Business | null;
    permissions: Permission[];
    featureFlags: FeatureFlag[];
    navigation: NavigationItem[];
    platformRole: PlatformRole;
    dashboardSnapshot: any; // Using any or DashboardData depending on where it's parsed
    authenticated: boolean;
    hydrated: boolean;
    loading: boolean;
    can: (resource: string, action: string) => boolean;
    switchBusiness: (id: string) => void;
}
