# iPhande — Platform Baseline v1.0
### Effective: 2026-07-14 · Supersedes: none

This document freezes the architectural decisions proven across Sprints 3–7.5 and Phase A.
Every future domain (Lead, Quote, Invoice, Work, Reflection) **must** conform to these standards.
Deviations require a governance decision and a new version of this document.

---

## 1 · Feature Module Grammar

Every business domain is a self-contained feature module under `src/features/<domain>/`.

### Required structure
```
src/features/<domain>/
  types/
    index.ts            <- Aggregate root, value objects, view models (no API types here)
  mappers/
    <domain>Mapper.ts   <- DTO -> Aggregate -> ViewModel (NEVER skip the Aggregate step)
  api/
    index.ts            <- Thin wrappers over Orval hooks only. Not exported publicly.
  hooks/
    index.ts            <- Query keys + useQuery hooks + useMutation hooks
  index.ts              <- Public exports: types + hooks + mapper (never api/)
```

### Rules
- `src/api/<domain>Api.ts` is **legacy**. Once a feature module exists it becomes read-only reference.
- Screens import exclusively from the feature module's `index.ts`.
- The `api/` folder is internal to the module. Screens **never** import from it directly.

---

## 2 · Aggregate Rules (DDD)

Every domain is modelled as an **Aggregate Root** — not a database row.

```typescript
// Correct — boundaries as value objects
interface OpportunityAggregate {
  identity:   OpportunityIdentity;
  lifecycle:  OpportunityLifecycle;
  visibility: OpportunityVisibility;
  pricing:    OpportunityPricing;
  capacity:   OpportunityCapacity;
  fulfilment: OpportunityFulfilment;
  media:      OpportunityMedia;
  analytics:  OpportunityAnalytics;
  audit:      OpportunityAudit;
}
```

### Rules
- Aggregate boundaries map to business concepts, not database columns.
- Aggregates are **internal**. They are never sent to screens directly.
- Screens only receive **View Models** projected from aggregates.

---

## 3 · Mapper Contract

The mapper is the **only permitted path** from network DTO to screen.

```
Generated DTO (OpportunityOut)     <- Orval — never edited by hand
        |  mapToAggregate()
Aggregate Root                     <- internal domain truth
        |  mapToCardViewModel()
        |  mapToDetailViewModel()
View Model                         <- what screens receive
```

### Rules
- Screens receive **View Models only**.
- Mappers live in `src/features/<domain>/mappers/<domain>Mapper.ts`.
- Mappers have no side effects and no async code — pure functions only.
- Every new domain must define: `mapToAggregate()` + at least one View Model projection.
- Fallback values for nullable DTO fields belong in the mapper, never in the screen.

---

## 4 · React Query Conventions

### Query Key Factory
Every feature module exports a `<domain>QueryKeys` constant:

```typescript
export const opportunityQueryKeys = {
  all:      ['opportunities'] as const,
  business: (profileId: string) => [...opportunityQueryKeys.all, 'business', profileId] as const,
  detail:   (id: string)       => [...opportunityQueryKeys.all, 'detail', id] as const,
};
```

### Rules
- All query keys are **typed** — no raw string arrays in call sites.
- Queries are always **enabled conditionally**: `enabled: !!requiredParam`.
- The `select` option always projects data through the mapper.
- Data shape passed to components is **always a View Model**, never a raw DTO.

---

## 5 · Mutation Rules

### Invalidation table
| Mutation scope | Must invalidate |
|---|---|
| Creates a new entity | `domain.all` + `['dashboard']` + `['bootstrap']` |
| Updates entity fields | `domain.detail(id)` + `['dashboard']` |
| Changes lifecycle state (publish/archive) | `domain.all` + `['dashboard']` + `['bootstrap']` |
| Deletes an entity | `domain.all` + `['dashboard']` |

Dashboard and bootstrap must always be invalidated on lifecycle state changes because they carry projection summaries.

---

## 6 · DTO Isolation Contract

```
src/generated/          <- machine-generated, never edited by hand
    api.ts              <- all Orval hooks
    models/             <- all DTO interfaces
```

### Rules
- Generated files are **read-only**. Re-run `npm run generate` if the spec changes.
- DTO types are imported **only** inside mappers.
- No DTO type ever reaches a component prop or a hook return type visible to screens.

---

## 7 · Composition Root Rules

`src/bootstrap/compositionRoot.ts` is the **only file** permitted to construct:
- The Axis Epistemic Kernel
- Infrastructure adapters (clock, logger, event bus, feature flags)
- Projection registrations
- Audit ledger wiring

All other files receive these objects through dependency injection.

---

## 8 · Release Gate

| Gate | Command | Required result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | Zero errors |
| DEBC linter (pending) | `npm run debc-lint` | Zero determinism violations |
| Unit tests (pending) | `npm test` | All pass |

The TypeScript gate is enforced on every commit.

---

## 9 · Domain Completion Checklist

Before a domain is **architecturally complete**:

- [ ] `types/index.ts` — Aggregate root + value objects + view models
- [ ] `mappers/<domain>Mapper.ts` — `mapToAggregate()` + at least one view model projection
- [ ] `hooks/index.ts` — Query key factory + all queries + all mutations
- [ ] `api/` — Orval wrappers (internal, not exported)
- [ ] `index.ts` — Public re-exports (types + hooks + mapper; never api)
- [ ] Zero TypeScript errors
- [ ] All mutations correctly invalidate dependent caches
- [ ] Screens import only from the feature module `index.ts`

---

## 10 · Proven Domain Modules (v1.0 baseline)

| Domain | Module path | Status |
|---|---|---|
| Authentication | `src/features/auth/` | Complete |
| Business | `src/features/business/` | Complete |
| Dashboard | `src/features/dashboard/` | Complete |
| Opportunity | `src/features/opportunity/` | Complete (steward side) |

### Pending
| Domain | Target module path |
|---|---|
| Lead | `src/features/lead/` |
| Quote | `src/features/quote/` |
| Invoice | `src/features/invoice/` |
| Work | `src/features/work/` |
| Reflection | `src/features/reflection/` |

---

*Maintained in `governance-architecture/PLATFORM_BASELINE_1.0.md`*
*Next version created when a new architectural pattern is proven in production.*
