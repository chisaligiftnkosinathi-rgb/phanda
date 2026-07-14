import { ActivationPolicy, MarketplacePolicy, PromotionPolicy, ReferralPolicy, BillingPolicy } from "@axionyx/contracts";

export const PRICING_POLICIES = {
    ACTIVATION_V1: {
        id: "ACTIVATION_V1",
        version: "1.0.0",
        effectiveFrom: new Date("2026-07-01T00:00:00Z"),
        activationFee: 120
    } as ActivationPolicy,
    
    MARKETPLACE_V1: {
        id: "MARKETPLACE_V1",
        version: "1.0.0",
        effectiveFrom: new Date("2026-07-01T00:00:00Z"),
        feeRate: 0.05 // 5%
    } as MarketplacePolicy,
    
    PROMOTION_V1: {
        id: "PROMOTION_V1",
        version: "1.0.0",
        effectiveFrom: new Date("2026-07-01T00:00:00Z"),
        promotionFee: 2.50
    } as PromotionPolicy,
    
    REFERRAL_V1: {
        id: "REFERRAL_V1",
        version: "1.0.0",
        effectiveFrom: new Date("2026-07-01T00:00:00Z"),
        rewardAmount: 50,
        maxRewardedReferrals: 5
    } as ReferralPolicy
};
