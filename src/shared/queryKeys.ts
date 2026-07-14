/**
 * Platform-level React Query key constants.
 *
 * These keys are cross-domain — they are NOT owned by any single feature engine.
 * Refer to docs/CACHE_CONTRACT.md for the full invalidation rules.
 *
 * Usage:
 *   import { sharedQueryKeys } from '@/shared/queryKeys';
 *   queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
 */

export const sharedQueryKeys = {
  /**
   * The steward's dashboard projection.
   * Invalidated by any mutation that changes the data surfaced on the dashboard.
   */
  dashboard: ['dashboard'] as const,

  /**
   * The session bootstrap projection.
   * Invalidated by any mutation that adds/removes a root entity
   * or changes session-level identity state (e.g. new lead, publish opportunity).
   */
  bootstrap: ['bootstrap'] as const,
} as const;
