# Business Loop Scenarios: The Reality Stress Tests

This document defines the real-world scenario stress tests for the iPhande ecosystem. A scenario is not just another sequence; it is a test of whether the canonical laws and platform loops can survive contact with the reality of the South African township economy (*ekasi*).

---

## Scenario 1: The Unknown Plumber (Visibility to Trust)
* **Goal:** Verify that a capable but unknown operator can establish presence and earn trust without pre-existing social connections.

```text
Skilled Plumber
    ↓
Invisible To Community (Zero network)
    ↓
Creates Steward Profile (Adds skills & sub-place location)
    ↓
Becomes Visible (Geo-match matches nearby request)
    ↓
Fulfills First Quote (Agreed via WhatsApp, paid cash)
    ↓
Uploads Evidence (Before/after photos + receipt capture)
    ↓
Trust Recalculated (Evidence turns into remembered reputation)
    ↓
Discovered by Next Client (Lower friction, higher confidence)
```

* **The Architectural Question:** Can a person with capability but no capital or connections become discoverable and trusted?
* **API Spec Mapping:** 
  * `POST /api/v1/profiles/bootstrap` (Initial registration)
  * `PATCH /api/v1/profiles/me` (Localized setup: sub-place, skills)
  * `GET /api/v1/feed/geo` / `GET /api/v1/match/opportunity/{id}` (Spatial discovery)
  * `POST /api/v1/media/evidence` (Work evidence upload)
  * `POST /api/v1/trust/recalculate/{profile_id}` (Trust loop updates)

---

## Scenario 2: The Spaza Memory Problem (Evidence to Continuity)
* **Goal:** Verify that a steward can prove business existence and viability using daily cash events instead of corporate bank statements.

```text
Spaza Shop Trades Daily (All cash-based)
    ↓
Logs Cash Events (Purchases, sales, supplier payouts)
    ↓
Logs Stock Ingestion & Consumption (Soda, bread, maize)
    ↓
System Ingests to The River (Telemetric stream logs)
    ↓
Steward Requests Cash Replay (Historical reconstruction of flow)
    ↓
Margin & Profit Snapshot Generated (Proof of viability generated)
```

* **The Architectural Question:** Can a steward prove their business exists and is viable without a formal bank account?
* **API Spec Mapping:**
  * `POST /api/v1/expenses` & `POST /api/v1/financial-events` (Inflow/outflow logging)
  * `POST /api/v1/inventory/items/{item_id}/consume-stock` (Inventory tracking)
  * `POST /api/v1/river/event` (Stream logging)
  * `GET /api/v1/financial-events/business/{id}/cash-replay` (Reconstructing history)
  * `GET /api/v1/financial-events/business/{id}/profit-snapshot` (Viability proof)

---

## Scenario 3: The Load Reduction Shock (Disruption to Adaptation)
* **Goal:** Verify that the system handles regular systemic disruptions (electricity/water cuts) as a normal operating mode, not an exception.

```text
Local Hairdresser Operating
    ↓
Load Reduction Hits (4 hours of power outage)
    ↓
Steward Logs Continuity Event (Flags loss of electricity)
    ↓
Impact Graph Updates (System alerts scheduled clients)
    ↓
Adaptation Action (Steward relocates to partner shop with backup generator)
    ↓
Activity Continues (Client appointments completed and re-routed)
```

* **The Architectural Question:** Can business continuity survive systemic infrastructure disruptions?
* **API Spec Mapping:**
  * `POST /api/v1/continuity-events/` (Logging the disruption)
  * `POST /api/v1/continuity-captures` (Capturing the current business state)
  * `GET /api/v1/continuity-events/{event_id}/graph` (Mapping downstream network impacts)
  * `GET /api/v1/availability/{profile_id}` (Status changes to offline/relocated)

---

## Scenario 4: The Community Recovery (Struggle to Grace)
* **Goal:** Verify that the platform can leverage community values to carry a trader through a crisis instead of letting them fail.

```text
Steward Injured / Shop Flooded
    ↓
Trading Activity Drops to Zero
    ↓
Continuity Event Captured
    ↓
Ecosystem Graph Triggers Campaign
    ↓
Solidarity Funding Activated (P2P micro-giving via network)
    ↓
Grace/Reflections Received (Emotional and community support)
    ↓
Steward Recovers & Resumes Operations
```

* **The Architectural Question:** Can the ecosystem carry someone through temporary weakness or does it let them fall off the map?
* **API Spec Mapping:**
  * `POST /api/v1/campaigns` (Creating a support push)
  * `POST /api/v1/giving/` (Processing community donations)
  * `GET /api/v1/scripture-reflections/daily/{id}` (Delivering resiliency content)
  * `GET /api/v1/steward-timeline/{id}` (Auditing the recovery path)

---

## Scenario 5: The First-Time Customer (Memory to Interaction)
* **Goal:** Verify that the preservation of economic memory is strong enough to substitute for the lack of formal contracts or personal relationships.

```text
Customer Needs Bricklayer
    ↓
Discovers Nearby Steward via Spatial Map
    ↓
Inspects Steward's Profile
    ↓
Views Historic Work Evidence (Verified photos of built walls)
    ↓
Views Cash Replay Velocity & Completed Follow-ups
    ↓
Engages Steward with High Confidence (Agreement reached)
```

* **The Architectural Question:** Can preserved memory substitute for missing formal/personal relationships?
* **API Spec Mapping:**
  * `GET /api/v1/public/business/{slug}` (Public view of the business)
  * `GET /api/v1/public/profiles` (Search and discover)
  * `GET /api/v1/steward-annotations/event/{target_event_id}` (Read annotations of past tasks)

---

## Scenario 6: The Steward Succession (Steward Exit to Memory Preservation)
* **Goal:** Verify that the reputation, history, and records of a business are bound to the community asset (the business identity and location) rather than solely to the individual, enabling generational transition.

```text
Steward Builds Years of Reputation
    ↓
Steward Retires, Relocates, or Passes Away
    ↓
Business Assets Transferred to Successor
    ↓
Historical Evidence & Memory Persists (Linked to Business/Place)
    ↓
Successor Bootstrapped with Existing Trust Baseline
    ↓
Economic Value Maintained (Ecosystem does not reset to zero)
```

* **The Architectural Question:** Does the economic memory survive the individual steward?
* **API Spec Mapping:**
  * `GET /api/v1/profiles/by-owner/{owner_id}` (Access history)
  * `POST /api/v1/profiles/bootstrap` (Linking new owner to existing location/history)
  * `GET /api/v1/steward-console/export` (Exporting complete historical records for transfer)