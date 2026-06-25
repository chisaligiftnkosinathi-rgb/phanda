# Screen-to-API Mapping Inventory

This document maps the Expo mobile application screens (`app/`) to their respective endpoints, tracing how the frontend interfaces with the canonical laws and memory systems of the iPhande API.

---

## The Mapping Matrix

| Route / File | Purpose | Canonical Law | API Endpoint(s) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Visibility Screen Group** | | | | |
| [app/public/explore.tsx](file:///C:/Projects/phanda/app/public/explore.tsx) | Search and display public opportunities and map them | Visibility / Opportunity | `GET /api/v1/public/opportunities` | **Wired** (fetch) |
| [app/public/index.tsx](file:///C:/Projects/phanda/app/public/index.tsx) | Main landing for public profiles, opportunities, and archetypes | Visibility / Opportunity | `fetchOpportunities`, `fetchArchetypes` | **Wired** (API client) |
| [app/public/[slug].tsx](file:///C:/Projects/phanda/app/public/[slug].tsx) | Detail view of a steward's public profile and contact options | Visibility / Trust | `GET /api/v1/public/{slug}`, `POST /api/v1/leads` | **Wired** (fetch) |
| [app/public/category/[archetype].tsx](file:///C:/Projects/phanda/app/public/category/[archetype].tsx) | Filter and display stewards by category archetype | Visibility | `fetchArchetypeProfiles` | **Wired** (API client) |
| [app/tabs/visibility.tsx](file:///C:/Projects/phanda/app/tabs/visibility.tsx) | Control steward visibility settings and generate sharing URLs | Visibility | `shareProfile` | **Wired** (API client) |
| [app/profile/settings.tsx](file:///C:/Projects/phanda/app/profile/settings.tsx) | Manage steward profile settings, whatsapp number, logo | Visibility | `updateMe` | **Wired** (API client) |
| [app/public/advertise.tsx](file:///C:/Projects/phanda/app/public/advertise.tsx) | Public advertisement creation | Visibility | `createPublicAdvertisement` | **Wired** (API client) |
| **Opportunity Screen Group** | | | | |
| [app/opportunities/new.tsx](file:///C:/Projects/phanda/app/opportunities/new.tsx) | Clients post localized jobs and needs | Opportunity | `POST /api/v1/opportunities` | **Wired** (fetch) |
| [app/opportunities/[id].tsx](file:///C:/Projects/phanda/app/opportunities/[id].tsx) | Detail view of a posted opportunity | Opportunity | `GET /api/v1/opportunities/{id}` | **Wired** (fetch) |
| [app/tabs/leads.tsx](file:///C:/Projects/phanda/app/tabs/leads.tsx) | List claimed leads, update statuses, start WhatsApp chat | Opportunity | `GET /api/v1/leads/me`, `PATCH /api/v1/leads/{id}` | **Wired** (fetch) |
| [app/tabs/index.tsx](file:///C:/Projects/phanda/app/tabs/index.tsx) | Feeds for matching opportunities and active ads | Opportunity / Visibility | `fetchOpportunities`, `fetchActiveAdvertisements`, `updateOpportunity` | **Wired** (API client) |
| **Evidence Screen Group** | | | | |
| [app/quotes/index.tsx](file:///C:/Projects/phanda/app/quotes/index.tsx) | Lists steward's issued quotes | Evidence / Trust | `fetchMyQuotes` | **Wired** (API client) |
| [app/quotes/new.tsx](file:///C:/Projects/phanda/app/quotes/new.tsx) | Create a new quote structure | Evidence | `POST /api/v1/quotes`, `PATCH /api/v1/leads/{leadId}` | **Wired** (fetch) |
| [app/quotes/[id].tsx](file:///C:/Projects/phanda/app/quotes/[id].tsx) | Detail view of a quote, accept quote, and create invoice | Evidence / Trust | `fetchQuoteDetail`, `acceptQuote`, `POST /api/v1/invoices/from-quote/{id}`, `GET /api/v1/documents/quotes/{id}/pdf` | **Wired** (fetch + API client) |
| [app/public/quotes/[token].tsx](file:///C:/Projects/phanda/app/public/quotes/[token].tsx) | Public client views shared quote and accepts it | Evidence / Trust | `publicFetchQuoteDetail`, `publicAcceptQuote` | **Wired** (API client) |
| [app/tools/calculator.tsx](file:///C:/Projects/phanda/app/tools/calculator.tsx) | Job cost calculator with immediate quote generation | Evidence | `POST /api/v1/quotes`, `PATCH /api/v1/leads/{id}` | **Wired** (fetch) |
| [app/tools/documents.tsx](file:///C:/Projects/phanda/app/tools/documents.tsx) | Audit timeline of generated quotes and share options | Evidence | `GET /api/v1/quotes/business/{profile.id}`, `shareQuote` | **Wired** (fetch + API client) |
| **Trust Screen Group** | | | | |
| [app/payment-verification.tsx](file:///C:/Projects/phanda/app/payment-verification.tsx) | Submit payment receipt for verification and poll status | Trust / Visibility | `GET /api/v1/profiles/me/payment-status`, `GET /api/v1/profiles/me`, `POST /api/v1/profiles/me/payment-proof` | **Wired** (fetch) |
| [app/activation/index.tsx](file:///C:/Projects/phanda/app/activation/index.tsx) | Stewards upload setup onboarding proof | Trust | `uploadPaymentProof`, `updateMe` | **Wired** (API client) |
| [app/tabs/profile.tsx](file:///C:/Projects/phanda/app/tabs/profile.tsx) | Steward's dashboard stats and custom trust metrics | Trust | `GET /api/v1/trust/profiles/{profile.id}/trust-profile` | **Wired** (fetch) |
| [app/admin/payment-proofs.tsx](file:///C:/Projects/phanda/app/admin/payment-proofs.tsx) | Admin review and approve/reject of onboarding proofs | Trust / Visibility | `getPaymentProofs`, `approvePayment`, `rejectPayment` | **Wired** (API client) |
| [app/admin/payments.tsx](file:///C:/Projects/phanda/app/admin/payments.tsx) | Admin approvals (referrals payouts, ads) | Trust / Visibility | `getPendingReferrals`, `markReferralPaid`, `rejectReferral`, `fetchPendingAdvertisements`, `approveAdvertisement`, `rejectAdvertisement` | **Wired** (API client) |
| [app/admin/users.tsx](file:///C:/Projects/phanda/app/admin/users.tsx) | Admin interface to manage user promotes/demotes | Trust | `getUsers`, `promoteAdmin`, `demoteAdmin` | **Wired** (API client) |
| **Continuity Screen Group** | | | | |
| [app/tabs/timeline.tsx](file:///C:/Projects/phanda/app/tabs/timeline.tsx) | Historical timeline of continuity events for the steward | Continuity / Evidence | `GET /api/v1/continuity-events/business/{profile.id}`, `shareProofOfWork` | **Wired** (fetch + API client) |
| [app/tabs/home.tsx](file:///C:/Projects/phanda/app/tabs/home.tsx) | Main home dashboard with drift telemetry, events, and stats | Continuity / Trust | `GET /api/v1/leads/me`, `GET /api/v1/opportunities`, `GET /api/v1/continuity-events/business/{id}`, `GET /api/v1/telemetry/drift` | **Wired** (fetch + API client) |
| [app/tools/inventory-tracker.tsx](file:///C:/Projects/phanda/app/tools/inventory-tracker.tsx) | Track inventory changes (logs continuity events) | Continuity / Evidence | `POST /api/v1/continuity-events/` | **Wired** (fetch) |
| [app/tools/km-tracker.tsx](file:///C:/Projects/phanda/app/tools/km-tracker.tsx) | Log mileage updates (logs continuity events) | Continuity / Evidence | `POST /api/v1/continuity-events/` | **Wired** (fetch) |
| [app/tools/notebook.tsx](file:///C:/Projects/phanda/app/tools/notebook.tsx) | Log raw business notes (logs continuity events) | Continuity / Evidence | `POST /api/v1/continuity-events/` | **Wired** (fetch) |
| [app/tools/proof-of-work.tsx](file:///C:/Projects/phanda/app/tools/proof-of-work.tsx) | Log work proofs (logs continuity events) | Continuity / Evidence | `POST /api/v1/continuity-events/` | **Wired** (fetch) |
| [app/expenses/index.tsx](file:///C:/Projects/phanda/app/expenses/index.tsx) | List steward business expenses | Continuity / Evidence | `getExpenses`, `getExpenseSummary` | **Wired** (API client) |
| [app/expenses/create.tsx](file:///C:/Projects/phanda/app/expenses/create.tsx) | Log new expense items | Continuity / Evidence | `createExpense`, `getExpenseCategories` | **Wired** (API client) |
| **Grace Screen Group** | | | | |
| [app/support/giving.tsx](file:///C:/Projects/phanda/app/support/giving.tsx) | Coordinates peer giving and solidarity funding | Grace | None (Directs to coordinator WhatsApp URL) | **WhatsApp Redirect** |
| [app/support/index.tsx](file:///C:/Projects/phanda/app/support/index.tsx) | Support hub landing | Grace | None (Directs to coordinator WhatsApp URL) | **WhatsApp Redirect** |
| [app/tools/referrals.tsx](file:///C:/Projects/phanda/app/tools/referrals.tsx) | Manage steward peer referrals | Grace | `getMyReferrals` | **Wired** (API client) |
