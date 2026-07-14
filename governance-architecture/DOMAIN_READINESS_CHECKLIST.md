# Domain Readiness Checklist

A domain is not considered complete until every item in this list is checked.
Use this for Lead, Quote, Work, Reflection, and any future domain.

---

## Aggregate Layer

- [ ] **Aggregate defined** — value objects grouped by bounded context (Identity, Lifecycle, etc.)
- [ ] **Value objects defined** — each sub-object is a named type, not a flat bag of primitives
- [ ] **Lifecycle states typed** — a union type (e.g. `LeadStatus`, `QuoteStatus`) with all known states
- [ ] **Impossible states prevented** — derived values (e.g. visibility, canQuote) are computed in the mapper, never set by the UI

## Mapper Layer

- [ ] **`mapToAggregate(dto)`** — single point of contact between the raw DTO and the domain model
- [ ] **`mapToCardViewModel(aggregate)`** — lightweight projection for list/feed screens
- [ ] **`mapToDetailViewModel(aggregate)`** — full projection for detail screens
- [ ] **`normalise*` helper** — unknown/null lifecycle states fall back to a safe default, never throw

## Query Layer

- [ ] **Query key factory** — `{ all, inbox/feed, detail }` shape (domain-scoped, not bare strings)
- [ ] **At least one list query** — returns an array of card view models
- [ ] **At least one detail query** — returns a single detail view model
- [ ] **`select:` used** — raw DTOs never reach screen components

## Command Layer

- [ ] **Create command** — wraps the POST mutation, invalidates `all` + `sharedQueryKeys.dashboard` + `sharedQueryKeys.bootstrap`
- [ ] **Status/lifecycle command** — wraps the PATCH mutation, invalidates `detail` + `sharedQueryKeys.dashboard`
- [ ] **`useMutation` used** — commands never call API hooks directly from screen components

## Cache Contract

- [ ] **`docs/CACHE_CONTRACT.md` updated** — every mutation for this domain is listed with its invalidation rules
- [ ] **`sharedQueryKeys` used** — no bare `['dashboard']` or `['bootstrap']` string arrays remain in hook files

## Architecture Standards

- [ ] **Zero TypeScript errors** — `npx tsc --noEmit` passes with this domain included
- [ ] **No DTO types in screen components** — all props are view model types, never generated types from `@/generated/models/`
- [ ] **Feature index exported** — `src/features/<domain>/index.ts` re-exports the public surface

## Documentation

- [ ] **Domain spec exists** — a `docs/` spec file (e.g. `LES-001.md`, `QES-001.md`) describes the aggregate boundaries and lifecycle
- [ ] **`PLATFORM_READINESS_REVIEW.md` updated** — domain status row added to the readiness matrix

## Phase Gate (before moving to the next Phase)

- [ ] **End-to-end journey validated** — the full business workflow (not isolated screens) works without a manual app refresh
- [ ] **Cache behavior verified** — cross-domain projections (Dashboard, Bootstrap) update correctly after mutations in this domain
- [ ] **Duplicate patterns reviewed** — any pattern that now appears in two or more domains has been evaluated for extraction to `src/shared/`

---

*Introduced: Phase B completion (July 2026)*
*Apply from: Quote Engine (Phase C) onwards*
