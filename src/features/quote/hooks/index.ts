import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useListQuotesForBusinessApiV1QuotesBusinessBusinessOwnerIdGet,
  useGetQuoteDetailApiV1QuotesQuoteIdGet,
  useCreateQuoteApiV1QuotesPost,
  useSendQuoteApiV1QuotesQuoteIdSendPost,
  useAcceptQuoteApiV1QuotesQuoteIdAcceptPost,
  useCreateInvoiceFromQuoteApiV1InvoicesFromQuoteQuoteIdPost,
} from '@/generated/api';
import { mapToAggregate, mapToCardViewModel, mapToDetailViewModel } from '../mappers/quoteMapper';
import type { QuoteOut } from '@/generated/models/quoteOut';
import type { QuoteCreate } from '@/generated/models/quoteCreate';
import { sharedQueryKeys } from '@/shared/queryKeys';
import { leadQueryKeys } from '@/features/lead/hooks';

// ─── QUERY KEYS ──────────────────────────────────────────────────────────────

export const quoteQueryKeys = {
  all:    ['quotes'] as const,
  list:   (businessId: string) => [...quoteQueryKeys.all, 'list', businessId] as const,
  detail: (id: string) =>        [...quoteQueryKeys.all, 'detail', id] as const,
};

// ─── QUERIES ─────────────────────────────────────────────────────────────────

/**
 * Returns all quotes for a given business, sorted newest-first.
 * Used by the steward's quote list screen.
 */
export function useBusinessQuotes(businessId: string) {
  return useListQuotesForBusinessApiV1QuotesBusinessBusinessOwnerIdGet(businessId, {
    query: {
      enabled: !!businessId,
      select: (data) =>
        (data as QuoteOut[])
          .map((dto) => mapToCardViewModel(mapToAggregate(dto)))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      queryKey: quoteQueryKeys.list(businessId),
    },
  });
}

/**
 * Returns the full detail view model for a single quote.
 */
export function useQuoteDetail(quoteId: string) {
  return useGetQuoteDetailApiV1QuotesQuoteIdGet(quoteId, {
    query: {
      enabled: !!quoteId,
      select: (data) => mapToDetailViewModel(mapToAggregate(data as QuoteOut)),
      queryKey: quoteQueryKeys.detail(quoteId),
    },
  });
}

// ─── COMMANDS ────────────────────────────────────────────────────────────────

/**
 * Creates a new quote (steward action, typically initiated from a lead).
 *
 * Cache contract:
 *   quoteQueryKeys.all      — list must refresh to show the new quote
 *   sharedQueryKeys.dashboard — dashboard quote count updates
 *   sharedQueryKeys.bootstrap — root entity count changes
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();
  const mutation = useCreateQuoteApiV1QuotesPost();

  return useMutation({
    mutationFn: (data: QuoteCreate) => mutation.mutateAsync({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
    },
  });
}

/**
 * Transitions a quote from Draft/Reviewed → Sent.
 *
 * Cache contract:
 *   quoteQueryKeys.detail(id) — quote status updates
 *   leadQueryKeys.inbox()     — lead status advances to Quoted (cross-domain)
 *   sharedQueryKeys.dashboard — dashboard pipeline view updates
 *
 * Note: This is the first cross-domain cache invalidation in the platform.
 * The Lead inbox is invalidated because sending a quote is what advances the
 * originating lead to "Quoted" status. The relationship is documented in
 * docs/CACHE_CONTRACT.md and is explicit here — not a hidden side effect.
 */
export function useSendQuote() {
  const queryClient = useQueryClient();
  const mutation = useSendQuoteApiV1QuotesQuoteIdSendPost();

  return useMutation({
    mutationFn: (args: { quoteId: string }) =>
      mutation.mutateAsync({ quoteId: args.quoteId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quoteQueryKeys.detail(variables.quoteId) });
      queryClient.invalidateQueries({ queryKey: leadQueryKeys.inbox() });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
    },
  });
}

/**
 * Accepts a quote (Sent → Accepted). Represents a commercial commitment.
 *
 * Cache contract:
 *   quoteQueryKeys.detail(id) — quote status updates
 *   sharedQueryKeys.dashboard — pipeline and conversion metrics update
 *   sharedQueryKeys.bootstrap — a committed work relationship now exists
 */
export function useAcceptQuote() {
  const queryClient = useQueryClient();
  const mutation = useAcceptQuoteApiV1QuotesQuoteIdAcceptPost();

  return useMutation({
    mutationFn: (args: { quoteId: string }) =>
      mutation.mutateAsync({ quoteId: args.quoteId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quoteQueryKeys.detail(variables.quoteId) });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
    },
  });
}

/**
 * Converts an accepted quote into an invoice.
 */
export function useConvertToInvoice() {
  const queryClient = useQueryClient();
  const mutation = useCreateInvoiceFromQuoteApiV1InvoicesFromQuoteQuoteIdPost();

  return useMutation({
    mutationFn: (args: { quoteId: string }) =>
      mutation.mutateAsync({ quoteId: args.quoteId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quoteQueryKeys.detail(variables.quoteId) });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: sharedQueryKeys.bootstrap });
    },
  });
}
