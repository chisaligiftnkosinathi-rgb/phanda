# Cache Contract

This document specifies the exact cache invalidation rules for React Query in the iPhande platform.
To avoid over-fetching, mutations MUST exactly follow these invalidation rules.

---

## Platform-Level Keys

These keys are **cross-domain** — they are not owned by any single feature engine.
All mutations that affect them must use `sharedQueryKeys` from `src/shared/queryKeys.ts`
rather than bare string arrays.

| Key             | Constant                        | Semantics                                             |
| --------------- | ------------------------------- | ----------------------------------------------------- |
| `['dashboard']` | `sharedQueryKeys.dashboard`     | Invalidated by any mutation that affects the steward's dashboard projection. |
| `['bootstrap']` | `sharedQueryKeys.bootstrap`     | Invalidated by any mutation that adds/removes a root entity or changes session-level identity state. |

---

## Opportunity Engine

| Command            | Must invalidate                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| Create Opportunity | `opportunityQueryKeys.all`, `sharedQueryKeys.dashboard`, `sharedQueryKeys.bootstrap` |
| Update Overview    | `opportunityQueryKeys.detail(id)`, `sharedQueryKeys.dashboard`            |
| Update Pricing     | `opportunityQueryKeys.detail(id)`                                         |
| Update Visibility  | `opportunityQueryKeys.detail(id)`, `sharedQueryKeys.dashboard`            |
| Update Capacity    | `opportunityQueryKeys.detail(id)`                                         |
| Update Media       | `opportunityQueryKeys.detail(id)`, `sharedQueryKeys.dashboard`            |
| Publish            | `opportunityQueryKeys.all`, `sharedQueryKeys.dashboard`, `sharedQueryKeys.bootstrap` |
| Archive            | `opportunityQueryKeys.all`, `sharedQueryKeys.dashboard`                   |

---

## Lead Engine

| Command             | Must invalidate                                                           |
| ------------------- | ------------------------------------------------------------------------- |
| Submit Lead         | `leadQueryKeys.all`, `sharedQueryKeys.dashboard`, `sharedQueryKeys.bootstrap` |
| Update Lead Status  | `leadQueryKeys.inbox()`, `leadQueryKeys.detail(id)`, `sharedQueryKeys.dashboard` |

> **Note:** Submit Lead invalidates `bootstrap` because it increments the business's total lead count,
> which is surfaced in the bootstrap projection. Status updates are bounded to the existing record
> and therefore do not affect `bootstrap`.

---

## Business Context

| Command            | Must invalidate                       |
| ------------------ | ------------------------------------- |
| Business Update    | `['business']`, `sharedQueryKeys.bootstrap` |

---

## Quote Engine

| Command      | Must invalidate                                                                    |
| ------------ | ---------------------------------------------------------------------------------- |
| Create Quote | `quoteQueryKeys.all`, `sharedQueryKeys.dashboard`, `sharedQueryKeys.bootstrap`     |
| Send Quote   | `quoteQueryKeys.detail(id)`, `leadQueryKeys.inbox()`, `sharedQueryKeys.dashboard`  |
| Accept Quote | `quoteQueryKeys.detail(id)`, `sharedQueryKeys.dashboard`, `sharedQueryKeys.bootstrap` |

> **Cross-domain rule — Send Quote:** `useSendQuote` invalidates `leadQueryKeys.inbox()` because
> sending a quote is the event that advances the originating lead's status to `Quoted`.
> This is the first intentional cross-domain cache invalidation in the platform.
> The relationship is explicit in `src/features/quote/hooks/index.ts` and documented here.
> Do not remove this invalidation without confirming the backend advances lead status independently.

---

## Rules of Thumb

- Bounded aggregate mutations that don't affect global lists → invalidate only `detail` for that entity.
- Mutations that change what the steward sees on the Dashboard → also invalidate `sharedQueryKeys.dashboard`.
- Mutations that add/remove root entities or alter session-identity state → also invalidate `sharedQueryKeys.bootstrap`.
- Every engine must document its mutations in this file before Phase completion is claimed.

