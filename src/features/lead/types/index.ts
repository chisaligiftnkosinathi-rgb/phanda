/**
 * Lead Engine Domain Models
 *
 * Implements the LES-001 specification.
 * Follows the feature module grammar defined in PLATFORM_BASELINE_1.0.
 */

// ─── AGGREGATE BOUNDARIES ────────────────────────────────────────────────────

export interface LeadIdentity {
  id: string;
  profileSlug: string;
}

export interface LeadContact {
  name: string;
  phone: string;
  location?: string;
}

export interface LeadRequest {
  serviceNeeded?: string;
  message?: string;
}

export type LeadStatus =
  | 'New'
  | 'Viewed'
  | 'Contacted'
  | 'Quoted'
  | 'Won'
  | 'Lost'
  | 'Spam';

export interface LeadLifecycle {
  status: LeadStatus;
  source: string;
  receivedAt: string;
}

// ─── AGGREGATE ROOT ──────────────────────────────────────────────────────────

/**
 * The internal domain representation of a Lead.
 * NEVER exposed directly from the API layer without passing through a Mapper.
 */
export interface LeadAggregate {
  identity: LeadIdentity;
  contact: LeadContact;
  request: LeadRequest;
  lifecycle: LeadLifecycle;
}

// ─── VIEW MODELS ─────────────────────────────────────────────────────────────

/**
 * Lightweight view model used in the business inbox list.
 */
export interface LeadCardViewModel {
  id: string;
  contactName: string;
  serviceNeeded: string;
  statusLabel: LeadStatus;
  receivedAt: string;
  isNew: boolean;
}

/**
 * Full view model for the lead detail screen.
 */
export interface LeadDetailViewModel {
  id: string;
  contactName: string;
  contactPhone: string;
  location: string;
  serviceNeeded: string;
  message: string;
  statusLabel: LeadStatus;
  source: string;
  receivedAt: string;
  canQuote: boolean;
}
