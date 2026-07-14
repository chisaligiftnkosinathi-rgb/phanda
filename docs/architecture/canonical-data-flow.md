# Canonical Data Flow: iPhande Economy

This document describes the complete lifecycle of every economic event in iPhande.
Every feature added to the platform should map to exactly one stage in this flow.
If a feature does not fit, that is a signal to revisit the design before implementing it.

---

## The Five Architectural Truths

| Layer | Role | Source |
|---|---|---|
| **API** | Operational Truth | Persists and serves real application data |
| **Repository** | Translation Truth | Maps DTOs to engine domain models |
| **Snapshot** | Decision Truth | Immutable frozen state for one kernel tick |
| **Engine** | Computational Truth | Deterministic decisions from snapshots |
| **Ledger** | Historical Truth | Records what actually happened and why |

---

## Full Event Lifecycle

```
User presses "Find work" (Pretoria → Plumbing)
          │
          ▼
   Intent Event (UI only expresses intent)
          │
          ▼
   ┌─────────────────────────────────┐
   │        Repositories             │
   │  ProfileRepository              │
   │  OpportunityRepository          │
   │  TrustRepository                │
   │  LocationRepository             │
   └──────────────┬──────────────────┘
                  │ (only domain models exit, never DTOs)
                  ▼
        ┌──────────────────────┐
        │   SnapshotFactory    │
        │   + Validator        │
        └──────────┬───────────┘
                   │ SystemSnapshot (immutable, frozen)
                   ▼
        ┌──────────────────────┐
        │   Execution Kernel   │
        │  Phase 1: Sense      │
        │  Phase 2: Fields     │
        │  Phase 3: Arbitration│
        │  Phase 4: Transitions│
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Forecast Engine    │ (Shadow Kernel — never mutates state)
        │   3 ticks ahead      │
        │   confidence decay   │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Policy Engine      │
        │   evaluateSystemPolicy│
        │   Risk Score         │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Gatekeeper         │ evaluateCommit()
        │   ALLOW / DEFER /    │ → { allowed, action, reasonCode }
        │   DROP               │
        └──────────┬───────────┘
                   │ Only allowed events pass through
                   ▼
        ┌──────────────────────┐
        │   Commit Phase       │
        │   appendToLedger()   │
        │   storeExplanation() │
        │   recordDecision()   │
        │   store.applyMutations│
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   API Write          │
        │   (via Repository)   │ e.g. createOpportunity()
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────┐
        │   useEconomicKernel() → EngineSnapshotView│
        │   emits unified read-only state to UI     │
        └──────────┬───────────────────────────────┘
                   │
                   ▼
           UI renders result:
           ┌─────────────────────────────────┐
           │  People: John (Trust 0.82)       │
           │  Work:   3 open, 2 emerging      │
           │  Forecast: Demand rising (+82%)  │
           │  Policy: NORMAL                  │
           │  Explanation: available on tap   │
           └─────────────────────────────────┘
```

---

## Non-Negotiable Architectural Rules

1. **No Engine ↔ API coupling**: The engine never imports `src/api/*`. Only repositories do.
2. **Snapshots are immutable**: Once a kernel tick starts, no engine code re-reads the API.
3. **One writer**: Economic mutations flow `Kernel → Policy → Gatekeeper → Repository → API`. Never UI → API directly.
4. **UI reads engine output only**: UI components import only `useEconomicKernel` and `EngineSnapshotView`. Never repositories, stores, or mocks.
5. **Date.now() once per tick**: Called only in `useEconomicKernel` at tick start. Passed as `timestamp` to everything downstream.
6. **Forecast never mutates**: The Shadow Kernel produces `ForecastTick[]` only. Zero side effects.
7. **Policy never mutates physics**: The Policy Engine evaluates and classifies. The Gatekeeper acts. Physics is untouched.
