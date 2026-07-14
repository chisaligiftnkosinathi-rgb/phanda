/**
 * Business Domain Models
 *
 * This defines the bounded context for Business Management.
 * Data is split into logical sections rather than one massive interface
 * to support granular updates (PATCH) and fine-grained permissions.
 */

// ─── OVERVIEW ─────────────────────────────────────────────────────────────

export interface BusinessOverview {
  legalName: string;
  tradingName: string;
  registrationNumber?: string;
  taxNumber?: string;
  foundedDate?: string;
  description?: string;
}

// ─── BRANDING ─────────────────────────────────────────────────────────────

export interface BusinessBranding {
  logoUrl?: string;
  coverUrl?: string;
  primaryColor?: string;
  slogan?: string;
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────

export interface BusinessContact {
  email: string;
  phone: string;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
}

// ─── VISIBILITY ───────────────────────────────────────────────────────────

export interface BusinessVisibility {
  isPublic: boolean;
  searchable: boolean;
  showOperatingHours: boolean;
  showLocation: boolean;
}

// ─── BANKING ──────────────────────────────────────────────────────────────

export interface BusinessBanking {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  accountType: 'checking' | 'savings' | 'transmission';
  verified: boolean;
}

// ─── COMPOSITE MODEL ──────────────────────────────────────────────────────

/**
 * The full Business projection used by the Business feature.
 * Typically constructed by a mapper from the raw API response.
 */
export interface BusinessProjection {
  id: string;
  overview: BusinessOverview;
  branding: BusinessBranding;
  contacts: BusinessContact;
  visibility: BusinessVisibility;
  banking: BusinessBanking;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
}
