/**
 * Quote Engine Domain Models
 *
 * Phase C — Quote Engine.
 * Follows the feature module grammar defined in FMS-001.
 *
 * Design notes:
 * - `amount`, `subtotal`, `vat` are kept as strings because the backend sends monetary
 *   values as strings. Coercion to number happens only in the mapper for display formatting.
 * - `opportunityId` is intentionally absent: QuoteCreate accepts it but QuoteOut does not
 *   return it. Do not add it until the backend exposes it on read (confirmed backend gap).
 * - `customerRequestId` links to a QuoteRequest or Lead; semantics are ambiguous from the
 *   spec — stored but not typed more narrowly until confirmed via backend behaviour.
 */

// ─── VALUE OBJECTS ───────────────────────────────────────────────────────────

export interface QuoteLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────────────

/**
 * Canonical frontend status set.
 * Maps from both the legacy backend set (issued/accepted/declined)
 * and the current set (quote_drafted/quote_sent/…).
 * normaliseQuoteStatus() in quoteMapper.ts owns this mapping.
 */
export type QuoteStatus =
  | 'Draft'
  | 'Reviewed'
  | 'Sent'
  | 'Accepted'
  | 'Declined'
  | 'Expired'
  | 'Converted';

// ─── AGGREGATE BOUNDARIES ────────────────────────────────────────────────────

export interface QuoteIdentity {
  id: string;
  businessOwnerId: string;
  /**
   * References a QuoteRequest or Lead depending on the originating flow.
   * Nullable — absent when a Quote is created directly without a request context.
   * Do not assert this is a Lead ID without backend confirmation.
   */
  customerRequestId?: string;
  quoteTemplateVersion: string;
}

export interface QuoteCustomer {
  name: string;
  phone?: string;
}

export interface QuotePricing {
  /** Raw string from backend — do not parse to float without formatting guard. */
  amount: string;
  subtotal?: string;
  vat?: string;
  currency: string;
  lineItems: QuoteLineItem[];
}

export interface QuoteTerms {
  description: string;
  freeformTerms?: string;
  structuredTerms?: Record<string, unknown> | QuoteStructuredTerm[];
}

export interface QuoteStructuredTerm {
  [key: string]: unknown;
}

export interface QuoteLifecycle {
  status: QuoteStatus;
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
}

export interface QuoteAudit {
  /** Continuity event ID for the initial draft — always present. */
  continuityEventId: string;
  /** Set once the quote has been sent to the customer. */
  sentContinuityEventId?: string;
  /** Set once the customer accepts. */
  acceptedContinuityEventId?: string;
}

// ─── AGGREGATE ROOT ──────────────────────────────────────────────────────────

/**
 * The internal domain representation of a Quote.
 * NEVER exposed directly from the API layer without passing through a Mapper.
 */
export interface QuoteAggregate {
  identity: QuoteIdentity;
  customer: QuoteCustomer;
  pricing: QuotePricing;
  terms: QuoteTerms;
  lifecycle: QuoteLifecycle;
  audit: QuoteAudit;
}

// ─── VIEW MODELS ─────────────────────────────────────────────────────────────

/**
 * Lightweight view model used in the business quote list.
 */
export interface QuoteCardViewModel {
  id: string;
  customerName: string;
  amountDisplay: string;
  statusLabel: QuoteStatus;
  createdAt: string;
  sentAt?: string;
}

/**
 * Full view model for the quote detail and creation screens.
 */
export interface QuoteDetailViewModel {
  id: string;
  customerName: string;
  customerPhone?: string;
  amountDisplay: string;
  subtotalDisplay?: string;
  vatDisplay?: string;
  currency: string;
  lineItems: QuoteLineItem[];
  description: string;
  freeformTerms?: string;
  /** Structured terms object (e.g. planning metadata). Access via safe casting. */
  structuredTerms?: Record<string, unknown> | QuoteStructuredTerm[];
  statusLabel: QuoteStatus;
  createdAt: string;
  sentAt?: string;
  acceptedAt?: string;
  /** True when the steward can transition this quote to Sent. */
  canSend: boolean;
  /** True when a customer acceptance action is possible. */
  canAccept: boolean;
}
