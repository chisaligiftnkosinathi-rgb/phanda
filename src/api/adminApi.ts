import { supabase } from '@/lib/supabase/client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
    };
}

export interface DashboardStats {
    total_profiles: number;
    pending_reviews: number;
    approved_profiles: number;
    total_opportunities: number;
}

export async function getAdminDashboard(): Promise<DashboardStats> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/dashboard`, { headers });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch dashboard stats');
    }
    return res.json();
}

export interface PaymentReview {
    profile_id: string;
    name: string;
    email: string;
    business_name?: string;
    setup_fee_status: string;
    setup_fee_proof_url?: string;
    setup_fee_review_note?: string;
}

export async function getPaymentProofs(status: string = 'pending_review'): Promise<PaymentReview[]> {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_URL}/api/v1/admin/profiles/payment-proofs`);
    if (status) {
        url.searchParams.append('status', status);
    }
    const res = await fetch(url.toString(), { headers });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch payment proofs');
    }
    return res.json();
}

export async function approvePayment(profileId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/profiles/${profileId}/approve-payment`, {
        method: 'POST',
        headers
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to approve payment');
    }
}

export async function rejectPayment(profileId: string, reviewNote: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/profiles/${profileId}/reject-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ review_note: reviewNote })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to reject payment');
    }
}

export interface UserAdmin {
    id: string;
    name: string;
    email: string;
    role: string;
}

export async function getUsers(): Promise<UserAdmin[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/users`, { headers });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch users');
    }
    return res.json();
}

export async function promoteAdmin(profileId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/users/${profileId}/promote-admin`, {
        method: 'POST',
        headers
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to promote to admin');
    }
}

export async function demoteAdmin(profileId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/users/${profileId}/demote-admin`, {
        method: 'POST',
        headers
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to demote admin');
    }
}

// ----------------------------------------------------------------------------
// Treasury Dashboard Client Functions
// ----------------------------------------------------------------------------
export interface TreasurySummary {
    gross_transaction_volume: number;
    platform_fee_revenue: number;
    treasury_vault_balance: number;
    merchant_earnings_total: number;
    merchant_payout_pending: number;
    total_orders_count: number;
    paid_orders_count: number;
    gateway_breakdown: Record<string, { order_count: number; volume: number }>;
    carrier_breakdown: Record<string, { shipment_count: number }>;
}

export interface TreasuryTransaction {
    id: string;
    order_number?: string;
    buyer_email?: string;
    merchant_id?: string;
    merchant_name?: string;
    gateway: string;
    payment_reference?: string;
    total_amount: number;
    platform_fee_10pct: number;
    merchant_earning_90pct: number;
    currency: string;
    status: string;
    created_at: string;
}

export interface PayoutQueueItem {
    merchant_id: string;
    merchant_name: string;
    email?: string;
    bank_name?: string;
    account_number?: string;
    branch_code?: string;
    available_balance: number;
    pending_payouts_count: number;
    currency: string;
}

export async function getTreasurySummary(): Promise<TreasurySummary> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/treasury/summary`, { headers });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch treasury summary');
    }
    return res.json();
}

export async function getTreasuryTransactions(limit: number = 50, offset: number = 0): Promise<TreasuryTransaction[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/treasury/transactions?limit=${limit}&offset=${offset}`, { headers });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch treasury transactions');
    }
    return res.json();
}

export async function getPayoutQueue(): Promise<PayoutQueueItem[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/treasury/merchants/payout-queue`, { headers });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch merchant payout queue');
    }
    return res.json();
}

export async function settleMerchantEarnings(merchantId: string, settlementReference?: string, notes?: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/treasury/merchants/${merchantId}/settle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ settlement_reference: settlementReference, notes })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to settle merchant earnings');
    }
    return res.json();
}

export interface TreasuryAnalytics {
    time_range: string;
    revenue_trends: Array<{
        date: string;
        gross_volume: number;
        platform_fee: number;
        merchant_share: number;
        order_count: number;
    }>;
    payout_velocity: {
        avg_payout_turnaround_hours: number;
        settled_last_7_days: number;
        settled_last_30_days: number;
        active_earning_merchants: number;
    };
    gateway_performance: Array<{
        provider: string;
        total_volume: number;
        transaction_count: number;
        success_rate: number;
        average_order_value: number;
    }>;
    carrier_distribution: Array<{
        carrier: string;
        shipment_count: number;
        percentage: number;
    }>;
}

export async function getTreasuryAnalytics(range: string = '30d'): Promise<TreasuryAnalytics> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/treasury/analytics?range=${range}`, { headers });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch treasury analytics');
    }
    return res.json();
}

// ----------------------------------------------------------------------------
// Merchant KYC Compliance & Review Functions
// ----------------------------------------------------------------------------
export interface MerchantKYCItem {
    merchant_id: string;
    merchant_name: string;
    email?: string;
    verification_status: string;
    id_document_url?: string;
    proof_of_address_url?: string;
    business_registration_number?: string;
    tax_number?: string;
    payout_enabled: boolean;
    created_at: string;
    pending_hours?: number;
    sla_status?: 'on_track' | 'approaching_sla' | 'breached';
    unclaimed_balance?: number;
    requires_nudge?: boolean;
}

export async function submitMerchantKYC(payload: {
    id_document_url: string;
    proof_of_address_url: string;
    business_registration_number?: string;
    tax_number?: string;
}): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/auth/merchant/kyc`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to submit KYC documents');
    }
    return res.json();
}

export async function getMerchantKYCQueue(status?: string, sortByUrgency: boolean = true): Promise<MerchantKYCItem[]> {
    const headers = await getAuthHeaders();
    let url = `${API_URL}/api/v1/admin/merchants/kyc-queue?sort_by_urgency=${sortByUrgency}`;
    if (status) {
        url += `&status=${status}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to fetch KYC queue');
    }
    return res.json();
}

export async function reviewMerchantKYC(merchantId: string, action: 'approve' | 'reject', notes?: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/merchants/${merchantId}/kyc-review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, notes })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to review KYC submission');
    }
    return res.json();
}

export async function nudgeMerchantKYC(merchantId: string, message?: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/merchants/${merchantId}/kyc-nudge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to send compliance nudge');
    }
    return res.json();
}

export async function triggerComplianceEscalations(): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/admin/compliance/escalations/trigger`, {
        method: 'POST',
        headers
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to trigger compliance escalations');
    }
    return res.json();
}




