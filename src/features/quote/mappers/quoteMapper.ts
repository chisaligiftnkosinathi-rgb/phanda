import type { QuoteOut } from '@/generated/models/quoteOut';
import type {
  QuoteAggregate,
  QuoteCardViewModel,
  QuoteDetailViewModel,
  QuoteLineItem,
  QuoteStatus,
} from '../types';

// ─── DTO → AGGREGATE ─────────────────────────────────────────────────────────

/**
 * Maps a raw backend QuoteOut DTO into the strictly-defined QuoteAggregate.
 * This is the only place where QuoteOut fields are accessed.
 */
export function mapToAggregate(dto: QuoteOut): QuoteAggregate {
  return {
    identity: {
      id: dto.id,
      businessOwnerId: dto.business_owner_id,
      customerRequestId: (dto.customer_request_id as string) || undefined,
      quoteTemplateVersion: dto.quote_template_version,
    },
    customer: {
      name: dto.customer_name,
      phone: (dto.customer_phone as string) || undefined,
    },
    pricing: {
      amount: dto.amount,
      subtotal: (dto.subtotal as string) || undefined,
      vat: (dto.vat as string) || undefined,
      currency: dto.currency,
      lineItems: parseLineItems(dto.line_items),
    },
    terms: {
      description: dto.description,
      freeformTerms: (dto.terms as string) || undefined,
      structuredTerms: (dto.structured_terms as Record<string, unknown>) || undefined,
    },
    lifecycle: {
      status: normaliseQuoteStatus(dto.status as string),
      createdAt: dto.created_at,
      sentAt: (dto.sent_at as string) || undefined,
      acceptedAt: (dto.accepted_at as string) || undefined,
    },
    audit: {
      continuityEventId: dto.continuity_event_id,
      sentContinuityEventId: (dto.sent_continuity_event_id as string) || undefined,
      acceptedContinuityEventId: (dto.accepted_continuity_event_id as string) || undefined,
    },
  };
}

// ─── AGGREGATE → CARD VIEW MODEL ─────────────────────────────────────────────

/**
 * Projects an aggregate into the lightweight card used in the business quote list.
 */
export function mapToCardViewModel(aggregate: QuoteAggregate): QuoteCardViewModel {
  return {
    id: aggregate.identity.id,
    customerName: aggregate.customer.name,
    amountDisplay: formatAmount(aggregate.pricing.amount, aggregate.pricing.currency),
    statusLabel: aggregate.lifecycle.status,
    createdAt: aggregate.lifecycle.createdAt,
    sentAt: aggregate.lifecycle.sentAt,
  };
}

// ─── AGGREGATE → DETAIL VIEW MODEL ───────────────────────────────────────────

/**
 * Projects an aggregate into the full detail view model used on the quote detail screen.
 */
export function mapToDetailViewModel(aggregate: QuoteAggregate): QuoteDetailViewModel {
  const { status } = aggregate.lifecycle;
  return {
    id: aggregate.identity.id,
    customerName: aggregate.customer.name,
    customerPhone: aggregate.customer.phone,
    amountDisplay: formatAmount(aggregate.pricing.amount, aggregate.pricing.currency),
    subtotalDisplay: aggregate.pricing.subtotal
      ? formatAmount(aggregate.pricing.subtotal, aggregate.pricing.currency)
      : undefined,
    vatDisplay: aggregate.pricing.vat
      ? formatAmount(aggregate.pricing.vat, aggregate.pricing.currency)
      : undefined,
    currency: aggregate.pricing.currency,
    lineItems: aggregate.pricing.lineItems,
    description: aggregate.terms.description,
    freeformTerms: aggregate.terms.freeformTerms,
    structuredTerms: aggregate.terms.structuredTerms,
    statusLabel: status,
    createdAt: aggregate.lifecycle.createdAt,
    sentAt: aggregate.lifecycle.sentAt,
    acceptedAt: aggregate.lifecycle.acceptedAt,
    // Business rules: transitions the steward can take
    canSend: status === 'Draft' || status === 'Reviewed',
    canAccept: status === 'Sent',
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Maps both the legacy backend status strings and the current backend status strings
 * to the canonical frontend QuoteStatus union.
 *
 * Legacy set:   issued | accepted | declined
 * Current set:  quote_drafted | quote_reviewed | quote_sent | quote_accepted |
 *               quote_declined | quote_expired | quote_converted
 *
 * Each domain owns its own normaliser. Do not extract to shared until a third
 * domain proves the abstraction boundary (see architectural decision, Phase C).
 */
function normaliseQuoteStatus(raw: string): QuoteStatus {
  switch (raw?.toLowerCase()) {
    case 'quote_drafted':
    case 'draft':
      return 'Draft';
    case 'quote_reviewed':
      return 'Reviewed';
    case 'quote_sent':
    case 'issued':
      return 'Sent';
    case 'quote_accepted':
    case 'accepted':
      return 'Accepted';
    case 'quote_declined':
    case 'declined':
      return 'Declined';
    case 'quote_expired':
      return 'Expired';
    case 'quote_converted':
      return 'Converted';
    default:
      return 'Draft';
  }
}

/**
 * Formats a monetary amount string for display.
 * Keeps the raw string value intact — no float arithmetic on monetary values.
 */
function formatAmount(amount: string, currency: string): string {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) return `${currency} ${amount}`;
  return `${currency} ${parsed.toFixed(2)}`;
}

/**
 * Safely parses the untyped line_items array from the DTO.
 */
function parseLineItems(raw: unknown): QuoteLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item !== 'object' || item === null) return { description: String(item) };
    const r = item as Record<string, unknown>;
    return {
      description: typeof r.description === 'string' ? r.description : '',
      quantity:    typeof r.quantity === 'number' ? r.quantity : undefined,
      unitPrice:   typeof r.unit_price === 'number' ? r.unit_price : undefined,
      total:       typeof r.total === 'number' ? r.total : undefined,
    };
  });
}
