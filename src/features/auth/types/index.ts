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

export type PlatformRole = "supaadmin" | "owner" | "admin" | "moderator" | "merchant" | "steward" | "buyer" | "guest";

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

export interface ApplicationState {
  stage: string;
}

export interface SetupState {
  exists: boolean;
  completed: boolean;
  current_step: number;
  total_steps: number;
}

export interface SubscriptionState {
  status: string;
  plan: string;
}

export interface WorkspaceSnapshot {
  visibility: string;
  category: string;
  location: string;
  subscription_plan: string;
}

export interface WorkspaceSummary {
  leads: number;
  quotes: number;
  views: number;
  followups: number;
}

export interface Workspace {
  priority: string;
  snapshot: WorkspaceSnapshot;
  summary: WorkspaceSummary;
}

export interface SessionContext {
    identity: Identity | null;
    businesses: Business[];
    selectedBusiness: Business | null;
    application: ApplicationState | null;
    setup: SetupState | null;
    subscription: SubscriptionState | null;
    workspace: Workspace | null;
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
