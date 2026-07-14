import { CausalTrace } from "@axionyx/audit/dist/model/TraceTypes";
import { Projection } from "@axionyx/runtime";

export interface WalletSummary {
    userId: string;
    pendingBalance: number;
    availableBalance: number;
    lastUpdated: string;
}

export class WalletSummaryProjection implements Projection<Map<string, WalletSummary>> {
    readonly projectionId = "wallet-summary-projection";
    readonly version = 1;

    initialize(): Map<string, WalletSummary> {
        return new Map<string, WalletSummary>();
    }

    apply(trace: CausalTrace, state: Map<string, WalletSummary>): Map<string, WalletSummary> {
        // Pure function: extract value flows
        for (const flow of trace.valueFlows) {
            // Use actionId as the grouping key since ValueFlow doesn't carry a userId directly
            const key = flow.actionId;
            if (!key) continue;

            const existing = state.get(key) || {
                userId: key,
                pendingBalance: 0,
                availableBalance: 0,
                lastUpdated: trace.createdAt
            };

            // Group by settlement status
            if (flow.settlementStatus === 'PENDING') {
                existing.pendingBalance += flow.amount;
            } else if (flow.settlementStatus === 'SETTLED') {
                existing.availableBalance += flow.amount;
            }

            existing.lastUpdated = trace.createdAt;
            state.set(key, existing);
        }
        return state;
    }
}
