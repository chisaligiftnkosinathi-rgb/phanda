/**
 * Opportunity Engine Domain Models
 *
 * Implements the OES-001 specification.
 */

// ─── AGGREGATE BOUNDARIES ──────────────────────────────────────────────────

export interface OpportunityIdentity {
  id: string;
  slug: string;
  title: string;
  description: string;
}

export type OpportunityLifecycleState =
  | 'Draft'
  | 'Published'
  | 'Visible'
  | 'Receiving Leads'
  | 'Quoted'
  | 'Accepted'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Reflected'
  | 'Archived';

export interface OpportunityLifecycle {
  state: OpportunityLifecycleState;
  publishedAt?: string;
  archivedAt?: string;
}

export interface OpportunityVisibility {
  isPublic: boolean;
  isSearchable: boolean;
  featured: boolean;
}

export interface OpportunityPricing {
  estimatedValue: number;
  currency: string;
  pricingType: 'fixed' | 'hourly' | 'negotiable';
}

export interface OpportunityCapacity {
  availableSlots?: number;
  waitlistActive: boolean;
}

export interface OpportunityFulfilment {
  isRemote: boolean;
  location?: string;
  requirements: string[];
}

export interface OpportunityMedia {
  coverImageUrl?: string;
  galleryUrls: string[];
}

export interface OpportunityAnalytics {
  views: number;
  clicks: number;
  leadsGenerated: number;
  conversionRate: number;
}

export interface OpportunityAudit {
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── AGGREGATE ROOT ────────────────────────────────────────────────────────

/**
 * The internal domain representation of an Opportunity.
 * This is NEVER exposed directly from the API layer without passing through a Mapper.
 */
export interface OpportunityAggregate {
  identity: OpportunityIdentity;
  lifecycle: OpportunityLifecycle;
  visibility: OpportunityVisibility;
  pricing: OpportunityPricing;
  capacity: OpportunityCapacity;
  fulfilment: OpportunityFulfilment;
  media: OpportunityMedia;
  analytics: OpportunityAnalytics;
  audit: OpportunityAudit;
}

// ─── VIEW MODELS ──────────────────────────────────────────────────────────

/**
 * Lightweight view model used in lists, feeds, and cards.
 */
export interface OpportunityCardViewModel {
  slug: string;
  title: string;
  state: OpportunityLifecycleState;
  priceDisplay: string;
  coverImage?: string;
  isRemote: boolean;
}

/**
 * Comprehensive view model used on detail pages.
 */
export interface OpportunityDetailViewModel {
  slug: string;
  title: string;
  description: string;
  state: OpportunityLifecycleState;
  priceDisplay: string;
  pricingType: string;
  locationDisplay: string;
  isRemote: boolean;
  images: string[];
  requirements: string[];
  metrics: OpportunityAnalytics;
}
