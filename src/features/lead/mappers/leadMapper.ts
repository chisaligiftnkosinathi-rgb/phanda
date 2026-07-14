import type { LeadOut } from '@/generated/models/leadOut';
import type {
  LeadAggregate,
  LeadCardViewModel,
  LeadDetailViewModel,
  LeadStatus,
} from '../types';

// ─── DTO → AGGREGATE ────────────────────────────────────────────────────────

/**
 * Maps a raw backend LeadOut DTO into the strictly-defined LeadAggregate.
 * This is the only place where LeadOut fields are accessed.
 */
export function mapToAggregate(dto: LeadOut): LeadAggregate {
  return {
    identity: {
      id: dto.id,
      profileSlug: dto.profile_slug,
    },
    contact: {
      name: dto.name,
      phone: dto.phone,
      location: (dto.customer_location as string) || undefined,
    },
    request: {
      serviceNeeded: (dto.service_needed as string) || undefined,
      message: (dto.message as string) || undefined,
    },
    lifecycle: {
      status: normaliseStatus(dto.status),
      source: dto.source,
      receivedAt: dto.created_at,
    },
  };
}

// ─── AGGREGATE → CARD VIEW MODEL ─────────────────────────────────────────────

/**
 * Projects an aggregate into the lightweight card used in the business inbox.
 */
export function mapToCardViewModel(aggregate: LeadAggregate): LeadCardViewModel {
  return {
    id: aggregate.identity.id,
    contactName: aggregate.contact.name,
    serviceNeeded: aggregate.request.serviceNeeded || 'General enquiry',
    statusLabel: aggregate.lifecycle.status,
    receivedAt: aggregate.lifecycle.receivedAt,
    isNew: aggregate.lifecycle.status === 'New',
  };
}

// ─── AGGREGATE → DETAIL VIEW MODEL ───────────────────────────────────────────

/**
 * Projects an aggregate into the full detail view model used on the lead detail screen.
 */
export function mapToDetailViewModel(aggregate: LeadAggregate): LeadDetailViewModel {
  return {
    id: aggregate.identity.id,
    contactName: aggregate.contact.name,
    contactPhone: aggregate.contact.phone,
    location: aggregate.contact.location || 'Not specified',
    serviceNeeded: aggregate.request.serviceNeeded || 'General enquiry',
    message: aggregate.request.message || '',
    statusLabel: aggregate.lifecycle.status,
    source: aggregate.lifecycle.source,
    receivedAt: aggregate.lifecycle.receivedAt,
    canQuote: aggregate.lifecycle.status !== 'Spam' && aggregate.lifecycle.status !== 'Lost',
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const KNOWN_STATUSES: LeadStatus[] = ['New', 'Viewed', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam'];

function normaliseStatus(raw: string): LeadStatus {
  const matched = KNOWN_STATUSES.find((s) => s.toLowerCase() === raw?.toLowerCase());
  return matched ?? 'New';
}
