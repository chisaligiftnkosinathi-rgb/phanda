/**
 * Quote Engine — public barrel export.
 *
 * Other modules should import from '@/features/quote', never deep-link into
 * internal files like '@/features/quote/mappers/quoteMapper'.
 */

// View model types (safe for screen components to import)
export type {
  QuoteStatus,
  QuoteLineItem,
  QuoteCardViewModel,
  QuoteDetailViewModel,
} from './types';

// Hooks
export {
  quoteQueryKeys,
  useBusinessQuotes,
  useQuoteDetail,
  useCreateQuote,
  useSendQuote,
  useAcceptQuote,
  useConvertToInvoice,
} from './hooks';
