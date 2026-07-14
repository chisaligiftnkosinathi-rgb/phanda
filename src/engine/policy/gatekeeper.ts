import { PolicyState, GatekeeperResult } from './types';
import { OpportunityEntity } from '@/types/marketplace';
import { PhaseEvent } from '@/types/phaseTransition';

export type CommitEvent = 
  | { type: "OPPORTUNITY_EMITTED", payload: OpportunityEntity }
  | { type: "PHASE_TRANSITION", payload: PhaseEvent };

/**
 * The ultimate control boundary of the system.
 * Filters kernel emissions before they are written to the store/ledger.
 */
export function evaluateCommit(
  event: CommitEvent,
  policyState: PolicyState
): GatekeeperResult {
  
  // 1. Hard Rules (Emergency Freeze)
  if (policyState.interventionLevel === "EMERGENCY_FREEZE") {
    return {
      allowed: false,
      action: "DROP",
      reasonCode: "POLICY_FREEZE"
    };
  }

  // 2. Load-based Rules (Throttle)
  if (policyState.interventionLevel === "THROTTLE" || policyState.interventionLevel === "RESTRICT") {
    // If the system is heavily loaded, we might delay new transitions that aren't critical
    if (event.type === "PHASE_TRANSITION" && event.payload.state === "POTENTIAL") {
      return {
        allowed: false,
        action: "DEFER",
        reasonCode: "SYSTEM_OVERLOAD"
      };
    }
  }

  // 3. Forecast Risk Rules
  // If the predictive horizon shows extreme density but low confidence, restrict risky locks.
  if (policyState.demandOverheat > 0.7 && policyState.forecastConfidence < 0.5) {
    if (event.type === "PHASE_TRANSITION" && event.payload.state === "LOCKED") {
       return {
         allowed: false,
         action: "DEFER",
         reasonCode: "FORECAST_RISK"
       };
    }
  }

  // 4. Default Allow
  return {
    allowed: true,
    action: "ALLOW",
    reasonCode: "OK"
  };
}
