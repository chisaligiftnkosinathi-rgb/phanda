import { CausalTrace } from "@axionyx/audit/dist/model/TraceTypes";
import { Projection } from "@axionyx/runtime";

export interface ProjectedOpportunity {
    opportunityId: string;
    creatorId: string;
    feedScore: number;
    title: string;
}

export class OpportunityFeedProjection implements Projection<Map<string, ProjectedOpportunity>> {
    readonly projectionId = "opportunity-feed-projection";
    readonly version = 1;

    initialize(): Map<string, ProjectedOpportunity> {
        return new Map<string, ProjectedOpportunity>();
    }

    apply(trace: CausalTrace, state: Map<string, ProjectedOpportunity>): Map<string, ProjectedOpportunity> {
        for (const op of trace.opportunities) {
            if (op.opportunityId) {
                const existing = state.get(op.opportunityId) || {
                    opportunityId: op.opportunityId,
                    creatorId: "unknown",
                    feedScore: 0,
                    title: "Opportunity"
                };

                // In a real scenario, this would aggregate data from the evidence payload
                // For now, we adjust feed scores based on trace truth confidence
                existing.feedScore += trace.truth.confidenceScore * 10;
                
                state.set(op.opportunityId, existing);
            }
        }
        return state;
    }
}
