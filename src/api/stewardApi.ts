import { fetchWithAuth } from '@/config/api';
import { Referral, ReferralMeResponse, StewardProfile } from '../types/steward';

/* ---------------------------------------------------
   CORE: PROFILE BOOTSTRAP
   Used when no profile exists to initialize the record.
--------------------------------------------------- */

export const bootstrapProfile = async (): Promise<StewardProfile> => {
    try {
        const response = await fetchWithAuth('/profiles/bootstrap', {
            method: 'POST',
        });
        return response as StewardProfile;
    } catch (error) {
        console.error('[StewardAPI] bootstrapProfile failed', error);
        throw error;
    }
};

/* ---------------------------------------------------
   CORE TRUTH SOURCE: /ME
   Fetches the active steward's complete profile.
--------------------------------------------------- */

export const getMe = async (): Promise<StewardProfile> => {
    try {
        const response = await fetchWithAuth('/profiles/me');
        return response as StewardProfile;
    } catch (error) {
        // Rethrow — the caller (StewardContext) decides how to handle 401/404
        throw error;
    }
};

export const updateMe = async (
    data: Partial<StewardProfile>
): Promise<StewardProfile> => {
    try {
        const response = await fetchWithAuth('/profiles/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response as StewardProfile;
    } catch (error) {
        console.error('[StewardAPI] updateMe failed', error);
        throw error;
    }
};

/* ---------------------------------------------------
   REFERRALS (USER LIFECYCLE EXTENSION)
--------------------------------------------------- */

export const getMyReferrals = async (): Promise<ReferralMeResponse> => {
    try {
        return await fetchWithAuth('/referrals/me');
    } catch (error) {
        console.error('[StewardAPI] getMyReferrals failed', error);
        throw error;
    }
};

export const getPendingReferrals = async (): Promise<Referral[]> => {
    try {
        return await fetchWithAuth('/admin/referrals/pending');
    } catch (error) {
        console.error('[StewardAPI] getPendingReferrals failed', error);
        throw error;
    }
};

export const markReferralPaid = async (
    referralId: string
): Promise<Referral> => {
    try {
        return await fetchWithAuth(`/admin/referrals/${referralId}/pay`, {
            method: 'PATCH',
        });
    } catch (error) {
        console.error(`[StewardAPI] markReferralPaid failed for ${referralId}`, error);
        throw error;
    }
};

export const rejectReferral = async (
    referralId: string
): Promise<Referral> => {
    try {
        return await fetchWithAuth(`/admin/referrals/${referralId}/reject`, {
            method: 'PATCH',
        });
    } catch (error) {
        console.error(`[StewardAPI] rejectReferral failed for ${referralId}`, error);
        throw error;
    }
};