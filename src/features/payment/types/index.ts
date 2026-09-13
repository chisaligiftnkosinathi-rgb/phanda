/**
 * Payment Domain Types
 * 
 * Follows DDD principles:
 * - Network DTOs (from backend API)
 * - Domain Aggregates (stable, business logic)
 * - View Models (screen-tailored)
 */

// ─── PAYMENT AGGREGATE ─────────────────────────────────────────────────────

export interface PaymentAggregate {
  id: string;
  invoiceId: string;
  quoteId: string;
  businessId: string;
  amount: number;
  currency: 'ZAR';
  status: PaymentStatus;
  
  // PayShap details
  payshapPaymentId: string | null;
  payshapLink: string | null;
  
  // Proof of payment (manual fallback)
  proofUrl: string | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export type PaymentStatus = 
  | 'pending'        // Awaiting payment intent creation
  | 'payment_link_generated'  // PayShap link ready
  | 'awaiting_payment'        // Customer has link, waiting for payment
  | 'payment_received'        // PayShap confirmed payment received
  | 'verified'       // Steward confirmed receipt
  | 'failed'         // Payment failed or cancelled
  | 'cancelled';     // User cancelled payment

// ─── PAYMENT REQUEST ──────────────────────────────────────────────────────

export interface CreatePaymentRequest {
  invoiceId: string;
  quoteId: string;
  amount: number;
  description?: string;
}

// ─── NETWORK DTO (From Backend) ────────────────────────────────────────────

export interface PaymentDTO {
  id: string;
  invoice_id: string;
  quote_id: string;
  business_id: string;
  amount: number;
  currency: string;
  status: string;
  payshap_payment_id: string | null;
  payshap_link: string | null;
  proof_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ─── VIEW MODELS (Screen-tailored) ────────────────────────────────────────

/**
 * PaymentCardViewModel
 * Displays in quote/invoice list - minimal info
 */
export interface PaymentCardViewModel {
  id: string;
  amount: string; // Formatted: "R 1,250.00"
  status: PaymentStatus;
  statusLabel: string; // "Pending", "Paid", etc.
  statusColor: string; // #4ade80, #ef4444, etc.
  createdAt: string; // "2 days ago"
}

/**
 * PaymentDetailViewModel
 * Full payment screen - all details + actions
 */
export interface PaymentDetailViewModel {
  id: string;
  invoiceId: string;
  quoteId: string;
  
  // Display values
  amount: string; // "R 1,250.00"
  status: PaymentStatus;
  statusLabel: string;
  statusColor: string;
  
  // PayShap integration
  hasPayshapLink: boolean;
  payshapLink: string | null;
  qrCodeUrl?: string; // Generated from payshap link
  
  // Manual proof fallback
  canUploadProof: boolean;
  proofUrl: string | null;
  
  // Timestamps
  createdAt: string; // "Jan 15, 2025"
  completedAt: string | null;
  
  // UI actions
  canGenerateLink: boolean;
  canUploadProof: boolean;
  canVerifyPayment: boolean;
}

/**
 * PaymentListViewModel
 * Payment history / list view
 */
export interface PaymentListViewModel {
  payments: PaymentCardViewModel[];
  totalAmount: string; // "R 5,000.00"
  paidAmount: string;
  pendingAmount: string;
}

// ─── PAYSHAP REQUEST/RESPONSE ─────────────────────────────────────────────

/**
 * PayShap Payment Link Request
 * Sent to PayShap API to generate a payment link
 */
export interface PayshapPaymentLinkRequest {
  amount: number; // In cents: 125000 for R 1,250.00
  reference: string; // e.g., "QUOTE-12345" or "INV-12345"
  customer_email?: string;
  customer_phone?: string;
  description: string;
  redirect_url?: string;
  fail_url?: string;
}

/**
 * PayShap Payment Link Response
 * Returned by PayShap when link is created
 */
export interface PayshapPaymentLinkResponse {
  id: string;
  link: string; // https://payshap.io/checkout/...
  amount: number;
  reference: string;
  created_at: string;
  expires_at?: string;
}

/**
 * PayShap Payment Status Response
 * Polled to check if customer has paid
 */
export interface PayshapPaymentStatusResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  reference: string;
  paid_amount?: number;
  transaction_id?: string;
  paid_at?: string;
}
