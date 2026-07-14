# Deterministic Engine Boundary Contract (DEBC)

This document is the **single authority** for deterministic execution boundaries in the engine.

It defines requirements for:
- time rules
- randomness rules
- execution boundaries
- module responsibilities
- forbidden patterns
- allowed escape hatches

---

## 1) Core Principle

> The engine must be replayable from stored data alone.

Formally:

```text
same (snapshot, tick input) → same output forever
```

No external system state is allowed to influence computation.

---

## 2) Time Architecture (CRITICAL)

### 2.1 Single Time Source Rule

Only one file may generate wall-clock time:

- `src/engine/kernel/scheduler.ts`

Allowed:

```ts
const currentTimestamp = Date.now()
```

Forbidden anywhere else:

- `Date.now()`
- `new Date()`
- `performance.now()`

---

### 2.2 Time Propagation Rule

All engine functions MUST use an injected

- `currentTimestamp: number`

NO defaults are allowed for time parameters.

---

### 2.3 Derived Time Rule

Allowed inside the engine **only** when the input is already deterministic:

```ts
Date.parse(isoString)
new Date(currentTimestamp).toISOString()
```

System time must never be used.

---

## 3) Randomness Rules

### 3.1 Absolute Prohibition Inside Engine

Forbidden anywhere inside engine code:

- `Math.random()`
- `crypto.randomUUID()`

---

### 3.2 Allowed Only via Injected Generator

Randomness-like operations must be replaced with deterministic generators provided by the scheduler/orchestrator.

Allowed:

- `idGen.next()`
- `TickIdGenerator(currentTimestamp)`

---

### 3.3 Deterministic ID Rule

IDs MUST depend only on:
- `tickTimestamp`
- entity input
- a deterministic counter

NEVER system entropy.

---

## 4) Module Responsibility Boundaries

### 4.1 `scheduler.ts` (ONLY boundary layer)

Responsibilities:
- generates `currentTimestamp`
- starts tick
- provides `idGen`
- calls runtime loop

Must NOT:
- compute physics
- modify domain state

---

### 4.2 `runtimeLoop.ts` (execution orchestrator)

Responsibilities:
- passes timestamp through system
- executes tick pipeline
- collects outputs

Must NOT:
- generate time
- use `Date.now()`
- decide randomness

---

### 4.3 Engine modules (PURE ZONE)

Examples:
- `demandField`
- `demandClustering`
- `trustPropagation`
- `forecastEngine`

Rules:
- MUST be pure functions of inputs + timestamp + idGen
- MUST not access external state
- MUST not carry hidden mutable caches across ticks

---

## 5) Forbidden Patterns (BUILD FAIL RULES)

If ANY appear in `src/engine/`:

```text
Date.now(
new Date(
Math.random(
crypto.randomUUID(
performance.now(
```

➡️ **BUILD FAIL**

---

## 6) Determinism Guarantee

Engine must satisfy:

```text
f(snapshot, currentTimestamp, idGen) → deterministic output
```

Required invariant:

```text
hash(output) is identical across runs
```

---

## 7) Default Parameter Rule (VERY IMPORTANT)

Defaults silently reintroduce nondeterminism and bypass compiler visibility.

Forbidden:

```ts
horizonTicks: number = 3
currentTime: number = Date.now()
```

Required:

```ts
horizonTicks: number
currentTime: number
```

---

## 8) Replay Contract

Replay must be possible via:

```ts
replay(ledger)
→ identical final snapshot
→ identical hash
```

No external inputs allowed.

---

## 9) CI Enforcement Rules (future hook)

Regex scanner (no dependencies required):

```bash
Date\.now\(
new Date\(
Math\.random\(
crypto\.randomUUID\(
performance\.now\(
```

If match found:

- `❌ FAIL BUILD`

---

## 10) Canonical Architecture Diagram (flow)

```text
scheduler.ts
   ↓ (Date.now ONLY here)
currentTimestamp + idGen
   ↓
runtimeLoop.ts
   ↓
engine modules (PURE)
   ↓
snapshot
   ↓
hash
   ↓
ledger
```

---

## 11) Emergency Rule (Kill Switch)

If system divergence is detected:

### DO NOT
- refactor multiple files
- guess call sites
- run endless `tsc` loops

### DO
1. isolate first failing file
2. fix ONLY that file
3. re-run deterministic build

---

## 12) Design Outcome

This contract enforces:
- single time authority
- explicit dependency injection
- fully replayable engine
- CI-enforceable determinism

---

End of DEBC
