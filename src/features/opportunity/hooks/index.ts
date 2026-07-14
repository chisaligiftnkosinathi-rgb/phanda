import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/features/auth/hooks/useAuth';
import {
  useGetOpportunityApiV1OpportunitiesOpportunityIdGet,
  useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch,
  useCreateOpportunityApiV1OpportunitiesPost,
  useListOpportunitiesApiV1OpportunitiesGet,
  useGetPublicOpportunitiesApiV1PublicOpportunitiesGet,
} from '@/generated/api';
import { mapToAggregate, mapToCardViewModel, mapToDetailViewModel } from '../mappers/opportunityMapper';
import type { OpportunityLifecycleState } from '../types';
import type { OpportunityOut } from '@/generated/models/opportunityOut';
import { sharedQueryKeys } from '@/shared/queryKeys';

// ─── QUERY KEYS ──────────────────────────────────────────────────────────────

export const opportunityQueryKeys = {
  all: ['opportunities'] as const,
  feed: () => [...opportunityQueryKeys.all, 'feed'] as const,
  publicFeed: (filters: Record<string, unknown>) => [...opportunityQueryKeys.all, 'public', filters] as const,
  featured: () => [...opportunityQueryKeys.all, 'featured'] as const,
  search: (filters: Record<string, unknown>) => [...opportunityQueryKeys.all, 'search', filters] as const,
  business: (profileId: string) => [...opportunityQueryKeys.all, 'business', profileId] as const,
  detail: (id: string) => [...opportunityQueryKeys.all, 'detail', id] as const,
  analytics: (id: string) => [...opportunityQueryKeys.all, 'analytics', id] as const,
  dashboard: () => [...opportunityQueryKeys.all, 'dashboard'] as const,
};

// ─── QUERIES ─────────────────────────────────────────────────────────────────

/**
 * Returns all opportunities belonging to the currently selected business profile.
 * Supports an optional status filter so the list screen can switch between
 * Draft / Published / Archived tabs without additional network calls.
 */
export function useBusinessOpportunities(statusFilter?: OpportunityLifecycleState) {
  const { selectedBusiness } = useSession();
  const profileId = selectedBusiness?.id;

  return useListOpportunitiesApiV1OpportunitiesGet(
    { profile_id: profileId ?? undefined },
    {
      query: {
        enabled: !!profileId,
        select: (data) => {
          const cards = data.map((dto) => mapToCardViewModel(mapToAggregate(dto)));
          if (!statusFilter) return cards;
          return cards.filter((c) => c.state === statusFilter);
        },
        queryKey: opportunityQueryKeys.business(profileId ?? ''),
      },
    }
  );
}

// ─── PUBLIC FEED ─────────────────────────────────────────────────────────────

export interface PublicFeedFilters {
  province?: string;
  city?: string;
  suburb?: string;
  archetype?: string;
}

/**
 * Unauthenticated public opportunity feed.
 * Used on the discovery screen — no session required.
 */
export function usePublicOpportunityFeed(filters: PublicFeedFilters = {}) {
  return useGetPublicOpportunitiesApiV1PublicOpportunitiesGet(
    {
      province: filters.province ?? undefined,
      city: filters.city ?? undefined,
      suburb: filters.suburb ?? undefined,
      archetype: filters.archetype ?? undefined,
    },
    {
      query: {
        select: (data) => (data as OpportunityOut[]).map((dto) => mapToCardViewModel(mapToAggregate(dto))),
        queryKey: opportunityQueryKeys.publicFeed(filters as Record<string, unknown>),
      },
    }
  );
}

/**
 * Returns grouped public opportunities filtered by province/city.
 */
export function usePublicOpportunities(filters: { province?: string; city?: string }) {
  return useGetPublicOpportunitiesApiV1PublicOpportunitiesGet(
    {
      province: filters.province ?? undefined,
      city: filters.city ?? undefined,
    },
    {
      query: {
        queryKey: opportunityQueryKeys.search(filters),
      },
    }
  );
}


/**
 * Returns the full detail view model for a single opportunity.
 * This is the only permitted path from DTO → UI for the detail screen.
 */
export function useOpportunityDetail(opportunityId: string) {
  return useGetOpportunityApiV1OpportunitiesOpportunityIdGet(opportunityId, {
    query: {
      enabled: !!opportunityId,
      select: (data) => mapToDetailViewModel(mapToAggregate(data)),
    },
  });
}

// ─── COMMANDS ────────────────────────────────────────────────────────────────

import type { OpportunityCreate } from '@/generated/models/opportunityCreate';

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  const mutation = useCreateOpportunityApiV1OpportunitiesPost();

  return useMutation({
    mutationFn: (data: OpportunityCreate) => mutation.mutateAsync({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
    },
  });
}

export function useUpdateOverview() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    mutationFn: (args: { opportunityId: string; title: string; description: string }) =>
      mutation.mutateAsync({
        opportunityId: args.opportunityId,
        data: { title: args.title, description: args.description },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.detail(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}

export function useUpdatePricing() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    mutationFn: (args: { opportunityId: string; estimatedValue: number; currency: string }) =>
      mutation.mutateAsync({
        opportunityId: args.opportunityId,
        data: { budget_amount: args.estimatedValue.toString() },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.detail(variables.opportunityId) });
    },
  });
}

export function useUpdateVisibility() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    mutationFn: (args: { opportunityId: string; isPublic: boolean }) =>
      mutation.mutateAsync({
        opportunityId: args.opportunityId,
        data: { status: args.isPublic ? 'Published' : 'Draft' },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.detail(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}

export function useUpdateCapacity() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    // Blocked: backend does not yet support slot fields.
    // When the backend is ready, add `slots` to the data payload.
    mutationFn: (args: { opportunityId: string; slots: number }) =>
      mutation.mutateAsync({ opportunityId: args.opportunityId, data: {} }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.detail(variables.opportunityId) });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    mutationFn: (args: { opportunityId: string; coverImageUrl: string }) =>
      mutation.mutateAsync({
        opportunityId: args.opportunityId,
        data: { image_url_1: args.coverImageUrl },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.detail(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}

export function usePublishOpportunity() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    mutationFn: (args: { opportunityId: string }) =>
      mutation.mutateAsync({ opportunityId: args.opportunityId, data: { status: 'Published' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
    },
  });
}

export function useArchiveOpportunity() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOpportunityApiV1OpportunitiesOpportunityIdPatch();

  return useMutation({
    mutationFn: (args: { opportunityId: string }) =>
      mutation.mutateAsync({ opportunityId: args.opportunityId, data: { status: 'Archived' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}
