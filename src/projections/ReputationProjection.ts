import { CausalTrace } from "@axionyx/audit/dist/model/TraceTypes";
import { Projection } from "@axionyx/runtime";

export interface UserReputation {
    userId: string;
    trustScore: number;
    verifiedEvidences: number;
}

export class ReputationProjection implements Projection<Map<string, UserReputation>> {
    readonly projectionId = "reputation-projection";
    readonly version = 1;

    initialize(): Map<string, UserReputation> {
        return new Map<string, UserReputation>();
    }

    apply(trace: CausalTrace, state: Map<string, UserReputation>): Map<string, UserReputation> {
        const actorId = trace.actions[0]?.actorId;
        if (!actorId) return state;

        const existing = state.get(actorId) || {
            userId: actorId,
            trustScore: 50, // default base score
            verifiedEvidences: 0
        };

        if (trace.truth.confidenceScore > 0.8) {
            existing.verifiedEvidences += 1;
            existing.trustScore += 5; // Reward high-confidence evidence
        } else if (trace.truth.confidenceScore < 0.3) {
            existing.trustScore -= 10; // Penalize spoofing/fakes
        }

        // Clamp 0-100
        existing.trustScore = Math.max(0, Math.min(100, existing.trustScore));

        state.set(actorId, existing);
        return state;
    }
}
