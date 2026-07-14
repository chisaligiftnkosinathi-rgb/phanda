import { FeatureFlagProvider, ExecutionMode } from "@axionyx/ports";

export class EnvironmentFeatureFlagProvider implements FeatureFlagProvider {
    getExecutionMode(capability: string): ExecutionMode {
        // In a real system, this would read from LD, Split.io, or environment variables.
        // For Phase 6 D, we default capabilities to SHADOW.
        return ExecutionMode.SHADOW;
    }
}
