import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useGetMyLeadsApiV1LeadsMeGet,
  useCreateLeadApiV1LeadsPost,
  useUpdateLeadStatusApiV1LeadsLeadIdPatch,
} from '@/generated/api';
import { mapToAggregate, mapToCardViewModel, mapToDetailViewModel } from '../mappers/leadMapper';
import type { LeadOut } from '@/generated/models/leadOut';
import type { LeadCreate } from '@/generated/models/leadCreate';
import { sharedQueryKeys } from '@/shared/queryKeys';

// ─── QUERY KEYS ──────────────────────────────────────────────────────────────

export const leadQueryKeys = {
  all:    ['leads'] as const,
  inbox:  () => [...leadQueryKeys.all, 'inbox'] as const,
  detail: (id: string) => [...leadQueryKeys.all, 'detail', id] as const,
};

// ─── QUERIES ─────────────────────────────────────────────────────────────────

/**
 * Returns the steward's business inbox — all leads for the selected business.
 * Sorted newest-first; unread leads surfaced via `isNew` on the card view model.
 */
export function useLeadInbox() {
  return useGetMyLeadsApiV1LeadsMeGet({
    query: {
      select: (data) =>
        (data as LeadOut[])
          .map((dto) => mapToCardViewModel(mapToAggregate(dto)))
          .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()),
      queryKey: leadQueryKeys.inbox(),
    },
  });
}

/**
 * Returns the full detail view model for a single lead.
 *
 * Implementation note: the backend does not expose a GET /leads/:id endpoint.
 * This hook shares the same GET /leads/me cache entry as useLeadInbox, then
 * derives the single record via `find()`. If the inbox hasn't been fetched yet
 * (e.g. direct deep-link navigation), React Query will trigger a fresh fetch
 * and the screen will show a loading state until it resolves.
 */
export function useLeadDetail(leadId: string) {
  return useGetMyLeadsApiV1LeadsMeGet({
    query: {
      enabled: !!leadId,
      staleTime: 0, // ensure a refetch occurs if this is the first screen loaded
      select: (data) => {
        const found = (data as LeadOut[]).find((d) => d.id === leadId);
        if (!found) return null;
        return mapToDetailViewModel(mapToAggregate(found));
      },
      queryKey: leadQueryKeys.detail(leadId),
    },
  });
}

// ─── COMMANDS ────────────────────────────────────────────────────────────────

/**
 * Submits a new lead from the public discovery screen.
 * No authentication required — this is a visitor action.
 */
export function useSubmitLead() {
  const queryClient = useQueryClient();
  const mutation = useCreateLeadApiV1LeadsPost();

  return useMutation({
    mutationFn: (data: LeadCreate) => mutation.mutateAsync({ data }),
    onSuccess: () => {
      // Baseline v1.0: entity creation → domain.all + dashboard + bootstrap
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
    },
  });
}

/**
 * Updates the status of a lead (e.g., New → Viewed → Contacted → Quoted).
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const mutation = useUpdateLeadStatusApiV1LeadsLeadIdPatch();

  return useMutation({
    mutationFn: (args: { leadId: string; status: string }) =>
      mutation.mutateAsync({ leadId: args.leadId, data: { status: args.status } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.inbox() });
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.detail(variables.leadId) });
      // Lifecycle state changes invalidate the dashboard projection
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}
