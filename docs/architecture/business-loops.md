# iPhande Business Loops: The Operational Core

To fully see how **iPhande API 0.1.0** acts as the operating system for the ekasi business ecosystem, we have to look past the endpoints as isolated lines of code and trace them as continuous **business loops**.

Below are the 5 core transactional, operational, and lifecycle loops that power the platform.

---

## Loop 1: Steward Onboarding, Vetting & Verification Loop

This loop transforms an informal business operator into an active, platform-trusted *steward* while managing system overhead costs (setup fees).

```text
[Steward]                      [System Admin]                 [Engines]
   │                                 │                            │
   ├───> POST /profiles (Bootstrap) ─┼───────────────────────────>│ (Profile created, state=pending)
   ├───> PATCH /profiles/me (Update) │                            │ (Adds whatsapp, suburb, category)
   │                                 │                            │
   ├───> POST /me/payment-proof ────>│                            │ (Uploads setup fee receipt)
   │                                 ├───> GET /admin/...-proofs  │ (Admin reviews payment)
   │                                 ├───> POST /admin/.../approve│ (Admin marks verified)
   │                                 │                            │
   │                                 └───────────────────────────>│ ──> POST /trust/recalculate/{id}
   │                                                              │ (Triggers Trust Engine baseline)
   V                                                              V
```

1. **Bootstrap & Profile Setup:** The steward kicks off registration via `POST /api/v1/profiles/bootstrap` or `POST /api/v1/profiles`. They enrich their localized profile data (`suburb`, `ward_id`, `whatsapp_number`) via `PATCH /api/v1/profiles/me`.
2. **Onboarding Guardrail:** Checking `GET /api/v1/profiles/me/onboarding-state` shows they are active but invisible until verified.
3. **The Fee Validation:** The steward drops a cash deposit or digital transfer and pushes the receipt up via `POST /api/v1/profiles/me/payment-proof`.
4. **Admin Clearance:** Admin polls pending submissions with `GET /api/v1/admin/profiles/payment-proofs` and flags it complete using `POST /api/v1/admin/profiles/{profile_id}/approve-payment`.
5. **Trust Activation:** The platform updates their visibility status (`PATCH /api/v1/profiles/{profile_id}/visibility`) and automatically fires `POST /api/v1/trust/recalculate/{profile_id}` to compute their starting community reputation weight.

---

## Loop 2: Marketplace Demand, Smart Routing & Lead Gen Loop

This loop matches client demands or local opportunities directly with localized stewards using geographic signals and the internal matching framework.

```text
[Client / Context]             [Smart Engines]               [Steward]
   │                                 │                            │
   ├───> POST /opportunities ────────>│                            │ (Client lists job / event)
   │                                 ├───> GET /feed/geo          │ (Engine spots regional activity)
   │                                 ├───> GET /match/opportunity │ (Geo Match Engine runs)
   │                                 │                            │
   │                                 ├───> POST /actions/dispatch │ (Dispatches inbox message)
   │                                 └───────────────────────────>├───> GET /actions/inbox/{id}
   │                                                              ├───> POST /leads (Claim opportunity)
   V                                                              V
```

1. **Opportunity Ingestion:** A consumer or community partner posts a direct requirement (e.g., *Plumbing breakdown in Khayelitsha Ward 90* or *Catering needed for weekend gathering*) using `POST /api/v1/opportunities`.
2. **Spatial Discovery:** The **Geo Feed Engine** tracks proximity streams (`GET /api/v1/feed/geo`), while background logic cross-references the location via `GET /api/v1/match/opportunity/{opportunity_id}`.
3. **Smart Routing Matrix:** The system queries `GET /api/v1/routing/decide/{action_id}/{profile_id}` to weigh who gets the notification first based on proximity, current status (`GET /api/v1/availability/{profile_id}`), and trust scores.
4. **Action Dispatch:** The system triggers `POST /api/v1/actions/dispatch` sending an alert directly to the steward's localized terminal inbox (`GET /api/v1/actions/inbox/{profile_id}`).
5. **Lead Conversion:** The steward flags receipt via `POST /api/v1/actions/{action_id}/deliver` and claims the customer relationship via `POST /api/v1/leads`.

---

## Loop 3: Quote-to-Cash & Real Evidence Loop

The core transactional machine. This maps negotiations, formalizes informal agreements, handles payments, tracks physical stock consumption, and builds transactional proof.

```text
[Steward]                      [Client / Terminal]               [Inventory & Ledger]
   │                                 │                                    │
   ├───> POST /quote-requests ──────>│                                    │ (Client requests/Steward drafts)
   ├───> POST /quotes/from-request ──│                                    │ (Drafted & pricing set)
   ├───> POST /quotes/{id}/send ────>│                                    │ (Dispatched via WhatsApp URL link)
   │                                 ├───> POST /quotes/{id}/accept       │ (Client clicks accept)
   │                                 │                                    │
   │  <─── [Cash/EFT/Wallet Payment Paid Outside System] ─────────────────┤
   │                                 │                                    │
   ├───> POST /payments/intents ─────┼───────────────────────────────────>│ (Log payment tracking intent)
   ├───> POST /intents/{id}/proofs ──┼───────────────────────────────────>│ (Upload POP image/receipt capture)
   ├───> POST /intents/{id}/verify ──┼───────────────────────────────────>│ (Steward confirms cash cleared)
   │                                 │                                    │
   ├───> POST /inventory/.../consume ┼───────────────────────────────────>│ (Deducts stock items e.g. wire, cement)
   ├───> POST /media/evidence ───────┼───────────────────────────────────>│ (Upload picture of finished task)
   V                                 V                                    V
```

1. **Quote Formulation:** Following client interaction, the steward issues a formal quote structure out of a demand ticket using `POST /api/v1/quote-requests/{quote_request_id}/quotes` or `POST /api/v1/quotes`.
2. **WhatsApp Dispatch:** The steward generates a shareable web reference with `GET /api/v1/share/quote/{quote_id}` and dispatches the quote to the client using `POST /api/v1/quotes/{quote_id}/send`.
3. **Acceptance & Intent:** The customer accepts (`POST /api/v1/quotes/{quote_id}/accept`), auto-generating an invoice target via `POST /api/v1/invoices/from-quote/{quote_id}`.
4. **Informal Payment Ledgering:** When dealing with cash-on-hand or external mobile e-wallet swaps, the steward logs the intent block via `POST /api/v1/payments/intents`. They add proof by hitting `POST /api/v1/payments/intents/{payment_id}/proofs` or uploading a receipt image via `/receipt-upload`.
5. **Settlement Confirmation:** The steward closes the loop locally by running `POST /api/v1/payments/intents/{payment_id}/verify` and issuing an automated receipt transaction via `POST /api/v1/payments/intents/{payment_id}/receipt`.
6. **Stock & Material Fulfillment:** To preserve accounting margins, the steward registers material deductions via `POST /api/v1/inventory/items/{item_id}/consume-stock`.
7. **Physical Proof Collection:** The final physical work product is uploaded to the ledger via `POST /api/v1/media/evidence` to solidify trust footprints.

---

## Loop 4: The "River" Telemetry, Cash Replay & Micro-Accounting Loop

This background loop captures every tiny event happening across the ecosystem to generate synthetic credit ratings and financial visibility for unbanked micro-enterprises.

```text
[Local Operations]             [The River / Stream]              [Financial Analytics]
   │                                 │                                    │
   ├───> POST /expenses ────────────>│                                    │ (Steward logs fuel/supplies)
   ├───> POST /financial-events ────>│                                    │ (Inbound income streams logged)
   │                                 │                                    │
   │                                 ├───> POST /river/event ────────────>│ (Dispatched down stream processor)
   │                                 │                                    │
   │                                 │<─── GET /financial-events/.../cash-replay
   │                                 │     (Reconstructs cash inflows/outflows)
   │                                 │<─── GET /financial-events/.../profit-snapshot
   │                                 │     (Calculates real margin vs obligations)
   V                                 V                                    V
```

1. **Telemetry Feed:** Every operational financial heartbeat—whether log entries from `POST /api/v1/expenses` or cash changes from `POST /api/v1/financial-events`—is treated as an event stream.
2. **Ingestion Engine:** The streaming framework ingests transactional behavior through `POST /api/v1/river/event`.
3. **Financial Statement Replay:** Instead of relying on rigid, traditional corporate bank statements, a steward can pull their raw transaction trail at any point using `GET /api/v1/financial-events/business/{business_owner_id}/cash-replay`. This dynamically replays their exact operational cash flow.
4. **Health Check Analytics:** The system evaluates performance metrics using `GET /api/v1/financial-events/business/{business_owner_id}/profit-snapshot` and tracks ongoing overhead commitments through `GET /api/v1/financial-events/business/{business_owner_id}/obligations`.
5. **System Verification Check:** System health administrators constantly watch for micro-transaction fraud or anomalies across the local network by keeping tabs on `GET /api/v1/telemetry/fraud-summary` and `GET /api/v1/telemetry/drift/`.

---

## Loop 5: Continuity, Social Safety Net & Grace Reflection Loop

This loop manages business disruptions (load reduction, family losses, supply shocks), coordinates peer-to-peer giving, and leverages local community values to maintain operational resilience.

```text
[Disruption Shock]            [Continuity Graph]            [Community / Support Network]
   │                                 │                                    │
   ├───> POST /continuity-events ───>│                                    │ (Log crisis: load reduction/illness)
   ├───> POST /continuity-captures ──│                                    │ (Snapshot operational status)
   │                                 │                                    │
   │                                 ├───> GET /continuity-events/{id}/graph
   │                                 │     (System maps downstream network impacts)
   │                                 │                                    │
   │  <─── [Automated Trigger System Activates Local Campaign Engine] ────┤
   │                                 │                                    │
   │                                 │<─── POST /giving/ (P2P financial aid sent)
   │                                 │<─── GET /scripture-reflections/daily/{id}
   │                                 │     (Deliver faith-based resiliency rules)
   V                                 V                                    V
```

1. **Crisis Capture:** When an operational shock hits an informal business ecosystem, the steward tracks the incident via `POST /api/v1/continuity-events/` and creates a status snapshot with `POST /api/v1/continuity-captures`.
2. **Impact Network Graphing:** System analytics construct an incident impact map via `GET /api/v1/continuity-events/{event_id}/graph`. This maps how a disruption for one distributor cascades down to hit local spaza shops or trade sub-contractors.
3. **Activating Community Relief:** The platform creates a support push using `POST /api/v1/campaigns` and custom messaging setups (`POST /api/v1/message-templates`).
4. **Peer Support Inbound Ledgering:** Neighboring traders and network users deploy local solidarity funds to help bridge cash gaps using `POST /api/v1/giving/` and `PATCH /api/v1/giving/{giving_id}/status`.
5. **Ecosystem Resilience Check:** The steward reviews their local support logs via `GET /api/v1/steward-timeline/{business_owner_id}` while drawing on community-driven coping frameworks and daily mental health/faith touchpoints via `GET /api/v1/scripture-reflections/daily/{owner_profile_id}`.

---

### Key Operational Observation:

Notice how the **Mobile Handshake & Heartbeat** (`/api/v1/mobile/handshake`) run continuously in parallel to keep offline Android field applications synced with the central event river, ensuring data stays updated even when networks are unstable.
