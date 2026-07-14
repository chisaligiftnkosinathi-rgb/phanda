import { EconomicOutcome, EconomicEffect, BillingPolicy } from "@axionyx/contracts";
import { PRICING_POLICIES } from "./config";

export interface ActorContext {
    id: string;
    billingPolicy?: BillingPolicy;
}

export class EconomicsEngine {
    
    public calculateMarketplaceFee(actor: ActorContext, transactionValue: number, currency: string = "ZAR"): EconomicOutcome {
        if (actor.billingPolicy === BillingPolicy.EXEMPT) {
            return {
                amount: 0,
                currency,
                effect: EconomicEffect.EXEMPT,
                policyId: "EXEMPT",
                policyVersion: "1.0.0"
            };
        }
        
        if (actor.billingPolicy === BillingPolicy.INTERNAL) {
            return {
                amount: 0,
                currency,
                effect: EconomicEffect.INTERNAL,
                policyId: "INTERNAL",
                policyVersion: "1.0.0"
            };
        }

        const policy = PRICING_POLICIES.MARKETPLACE_V1;
        const feeAmount = transactionValue * policy.feeRate;
        
        return {
            amount: feeAmount,
            currency,
            effect: EconomicEffect.CHARGE,
            policyId: policy.id,
            policyVersion: policy.version
        };
    }

    public calculateActivationFee(actor: ActorContext, currency: string = "ZAR"): EconomicOutcome {
        if (actor.billingPolicy === BillingPolicy.EXEMPT || actor.billingPolicy === BillingPolicy.INTERNAL) {
            return {
                amount: 0,
                currency,
                effect: actor.billingPolicy as string as EconomicEffect,
                policyId: actor.billingPolicy as string,
                policyVersion: "1.0.0"
            };
        }

        const policy = PRICING_POLICIES.ACTIVATION_V1;
        return {
            amount: policy.activationFee,
            currency,
            effect: EconomicEffect.CHARGE,
            policyId: policy.id,
            policyVersion: policy.version
        };
    }

    public calculateReferralReward(actor: ActorContext, referralCount: number, currency: string = "ZAR"): EconomicOutcome {
        const policy = PRICING_POLICIES.REFERRAL_V1;
        
        // Reward applies to first N successful referrals
        if (referralCount <= policy.maxRewardedReferrals) {
            return {
                amount: policy.rewardAmount,
                currency,
                effect: EconomicEffect.REWARD,
                policyId: policy.id,
                policyVersion: policy.version
            };
        }
        
        return {
            amount: 0,
            currency,
            effect: EconomicEffect.REWARD, // or NO_EFFECT if we had one, but 0 amount suffices
            policyId: policy.id,
            policyVersion: policy.version
        };
    }
    
    public calculateSupportContribution(amount: number, currency: string = "ZAR"): EconomicOutcome {
        // Support/Give is voluntary, so the amount is just passed through.
        return {
            amount,
            currency,
            effect: EconomicEffect.CONTRIBUTION,
            policyId: "SUPPORT_V1",
            policyVersion: "1.0.0"
        };
    }
}
