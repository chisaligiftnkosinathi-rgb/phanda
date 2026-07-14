/**
 * Trust Engine Types
 * Represents trust scoring, visibility, and proof of work
 */

export interface TrustScore {
  user_id: string;
  overall_score: number;
  verification_score: number;
  completion_score: number;
  visibility_score: number;
  components: {
    verified_profile: boolean;
    verified_merchant_account: boolean;
    successful_payments: number;
    successful_proofs: number;
    on_time_completion_rate: number;
    customer_ratings_avg?: number;
  };
  calculated_at: string;
}

export interface VisibilityStatus {
  user_id: string;
  is_visible: boolean;
  visibility_reason: string;
  trust_level: 'new' | 'trusted' | 'verified' | 'premium';
  visibility_percentage: number;
  restrictions?: string[];
}

export interface ProofOfWork {
  id: string;
  opportunity_id: string;
  user_id: string;
  photo_url: string;
  title: string;
  description?: string;
  completed_date: string;
  submitted_at: string;
  status: 'submitted' | 'approved' | 'rejected' | 'pending_review';
  reviewer_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface ProofUploadRequest {
  opportunity_id: string;
  photo_url: string;
  title: string;
  description?: string;
  completed_date: string;
}

export interface TrustFeedEvent {
  id: string;
  user_id: string;
  event_type: 'proof_submitted' | 'proof_approved' | 'payment_received' | 'trust_updated' | 'verification_changed';
  title: string;
  description: string;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface TrustTimeline {
  events: TrustFeedEvent[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface TrustUpdate {
  user_id: string;
  change_type: 'verified' | 'proof_added' | 'payment_confirmed' | 'score_updated';
  old_value?: string | number;
  new_value?: string | number;
  changed_at: string;
  reason?: string;
}

export interface VisibilityRules {
  requires_verification: boolean;
  requires_merchant_account: boolean;
  requires_minimum_trust_score: number;
  requires_successful_payment_count: number;
  requires_proof_count: number;
}
