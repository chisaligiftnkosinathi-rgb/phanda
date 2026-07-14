import type { OpportunityOut } from '@/generated/models/opportunityOut';
import type { OpportunityAggregate, OpportunityCardViewModel, OpportunityDetailViewModel, OpportunityLifecycleState, OpportunityVisibility } from '../types';

/**
 * Maps raw backend DTOs into the strictly defined Aggregate Root.
 */
export function mapToAggregate(dto: OpportunityOut): OpportunityAggregate {
  const lifecycleState = normaliseLifecycleState(dto.status);

  return {
    identity: {
      id: dto.id,
      slug: dto.id, // Fallback to ID if no slug provided
      title: dto.title,
      description: dto.description as string || '',
    },
    lifecycle: {
      state: lifecycleState,
    },
    // Visibility is a domain invariant derived from lifecycle.
    // An Opportunity CANNOT be public unless it is in a publicly-active state.
    // Change the rule here; never in the UI layer.
    visibility: deriveVisibility(lifecycleState),
    pricing: {
      estimatedValue: Number(dto.budget_amount) || 0,
      currency: 'ZAR',
      pricingType: 'fixed',
    },
    capacity: {
      waitlistActive: false,
    },
    fulfilment: {
      isRemote: false,
      location: dto.town_or_city as string || '',
      requirements: [],
    },
    media: {
      coverImageUrl: dto.image_url_1 as string || undefined,
      galleryUrls: [dto.image_url_1, dto.image_url_2].filter(Boolean) as string[],
    },
    analytics: {
      views: 0,
      clicks: 0,
      leadsGenerated: 0,
      conversionRate: 0,
    },
    audit: {
      createdBy: dto.created_by_profile_id,
      createdAt: dto.created_at,
      updatedAt: dto.created_at,
    }
  };
}

/**
 * Projects an Aggregate into the lightweight Card ViewModel.
 */
export function mapToCardViewModel(aggregate: OpportunityAggregate): OpportunityCardViewModel {
  return {
    slug: aggregate.identity.slug,
    title: aggregate.identity.title,
    state: aggregate.lifecycle.state,
    priceDisplay: `${aggregate.pricing.currency} ${aggregate.pricing.estimatedValue}`,
    coverImage: aggregate.media.coverImageUrl,
    isRemote: aggregate.fulfilment.isRemote,
  };
}

/**
 * Projects an Aggregate into the comprehensive Detail ViewModel.
 */
export function mapToDetailViewModel(aggregate: OpportunityAggregate): OpportunityDetailViewModel {
  return {
    slug: aggregate.identity.slug,
    title: aggregate.identity.title,
    description: aggregate.identity.description,
    state: aggregate.lifecycle.state,
    priceDisplay: `${aggregate.pricing.currency} ${aggregate.pricing.estimatedValue}`,
    pricingType: aggregate.pricing.pricingType,
    locationDisplay: aggregate.fulfilment.isRemote ? 'Remote' : (aggregate.fulfilment.location || 'TBD'),
    isRemote: aggregate.fulfilment.isRemote,
    images: aggregate.media.galleryUrls,
    requirements: aggregate.fulfilment.requirements,
    metrics: aggregate.analytics,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const KNOWN_STATES: OpportunityLifecycleState[] = [
  'Draft', 'Published', 'Visible', 'Receiving Leads',
  'Quoted', 'Accepted', 'Scheduled', 'In Progress',
  'Completed', 'Reflected', 'Archived',
];

/**
 * States in which an Opportunity is considered publicly active.
 * Only opportunities in these states appear on the public discovery feed.
 * To change a visibility rule, update this set — never the UI layer.
 */
const PUBLIC_ACTIVE_STATES: ReadonlySet<OpportunityLifecycleState> = new Set([
  'Published',
  'Visible',
  'Receiving Leads',
  'Quoted',
  'Accepted',
  'Scheduled',
  'In Progress',
]);

/**
 * Derives the visibility invariant from lifecycle state.
 * Visibility is NOT an independent boolean — it is a projection of lifecycle.
 * This prevents impossible states like Draft+Public or Archived+Visible.
 */
function deriveVisibility(state: OpportunityLifecycleState): OpportunityVisibility {
  const isPublic = PUBLIC_ACTIVE_STATES.has(state);
  return {
    isPublic,
    isSearchable: isPublic,  // Searchability always mirrors public visibility
    featured: false,          // Featured is a curated platform flag, not derived from lifecycle
  };
}

function normaliseLifecycleState(raw: string): OpportunityLifecycleState {
  const matched = KNOWN_STATES.find((s) => s.toLowerCase() === raw?.toLowerCase());
  return matched ?? 'Draft';
}
