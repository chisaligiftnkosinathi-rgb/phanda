# iPhande API (0.1.0)
*OAS 3.1*
Visibility, opportunity continuity, replay, and grace reflection platform.

## Endpoints

### Health & System
* `GET /health` - Health Check
* `GET /db-health` - Db Health Check
* `GET /api/v1/health` - Health Check
* `GET /api/v1/db-health` - Db Health Check

### Profiles
* `GET /api/v1/public/profiles` - List Public Profiles
* `POST /api/v1/profiles` - Create Profile
* `GET /api/v1/profiles` - List Profiles
* `POST /api/v1/profiles/bootstrap` - Bootstrap Profile
* `GET /api/v1/profiles/me` - Get My Profile
* `PATCH /api/v1/profiles/me` - Update My Profile
* `GET /api/v1/profiles/me/onboarding-state` - Get My Onboarding State
* `GET /api/v1/profiles/{profile_id}` - Get Profile
* `GET /api/v1/profiles/by-owner/{owner_id}` - Get Profile By Owner
* `GET /api/v1/public/{slug}` - Get Public Profile
* `PATCH /api/v1/profiles/{profile_id}/location` - Update Profile Location
* `PATCH /api/v1/profiles/{profile_id}/visibility` - Update Profile Visibility
* `PATCH /api/v1/profiles/{profile_id}/setup-fee` - Review Setup Fee
* `POST /api/v1/profiles/me/payment-proof` - Submit Payment Proof
* `GET /api/v1/profiles/me/payment-status` - Get Payment Status

### Opportunities
* `POST /api/v1/opportunities` - Create Opportunity
* `GET /api/v1/opportunities` - List Opportunities
* `GET /api/v1/opportunities/nearby` - List Nearby Opportunities
* `GET /api/v1/opportunities/{opportunity_id}` - Get Opportunity
* `PATCH /api/v1/opportunities/{opportunity_id}` - Update Opportunity
* `POST /api/v1/opportunities/{opportunity_id}/timeline` - Add Timeline Event
* `GET /api/v1/opportunities/{opportunity_id}/timeline` - Get Timeline

### Referrals
* `GET /api/v1/referrals/me` - Get My Referrals
* `GET /api/v1/admin/referrals/pending` - Get Pending Referrals
* `PATCH /api/v1/admin/referrals/{referral_id}/pay` - Mark Referral Paid
* `PATCH /api/v1/admin/referrals/{referral_id}/reject` - Reject Referral

### Advertisements
* `POST /api/v1/advertisements/public` - Create Advertisement
* `GET /api/v1/advertisements/public` - List Active Advertisements
* `GET /api/v1/admin/advertisements/pending` - List Pending Advertisements
* `PATCH /api/v1/admin/advertisements/{ad_id}/approve` - Approve Advertisement
* `PATCH /api/v1/admin/advertisements/{ad_id}/reject` - Reject Advertisement

### Followups
* `POST /api/v1/followups` - Create Followup
* `GET /api/v1/followups/today` - Get Today Followups
* `PATCH /api/v1/followups/{followup_id}/complete` - Complete Followup

### Business Content Rules
* `GET /api/v1/business-content-rules` - List Business Content Rules
* `GET /api/v1/business-content-rules/{category_key}` - Get Business Content Rule

### Media
* `POST /api/v1/media/evidence` - Record Evidence

### Quote Requests & Quotes
* `POST /api/v1/quote-requests` - Create Quote Request
* `GET /api/v1/quote-requests` - List Quote Requests
* `GET /api/v1/quote-requests/{quote_request_id}` - Get Quote Request
* `PATCH /api/v1/quote-requests/{quote_request_id}/status` - Update Quote Status
* `POST /api/v1/quote-requests/{quote_request_id}/review` - Review Quote Request
* `POST /api/v1/quote-requests/{quote_request_id}/contact` - Contact Quote Request
* `POST /api/v1/quote-requests/{quote_request_id}/convert` - Convert Quote Request
* `POST /api/v1/quote-requests/{quote_request_id}/close` - Close Quote Request
* `POST /api/v1/quote-requests/{quote_request_id}/submit-application` - Submit Quote Request Application
* `POST /api/v1/quote-requests/{quote_request_id}/upload-sale-evidence` - Upload Sale Evidence For Quote Request
* `POST /api/v1/quote-requests/{quote_request_id}/confirm-sale` - Confirm Quote Request Sale
* `POST /api/v1/quote-requests/{quote_request_id}/quotes` - Draft Quote From Request
* `POST /api/v1/quotes` - Create Quote
* `GET /api/v1/quotes/business/{business_owner_id}` - List Quotes For Business
* `GET /api/v1/quotes/me` - Get My Quotes
* `GET /api/v1/quotes/{quote_id}` - Get Quote Detail
* `POST /api/v1/quotes/{quote_id}/send` - Send Quote
* `POST /api/v1/quotes/{quote_id}/payment-intents` - Create Payment Intent From Quote
* `POST /api/v1/quotes/{quote_id}/accept` - Accept Quote

### Reflections
* `GET /api/v1/reflections` - List Reflections
* `POST /api/v1/reflections` - Create Reflection
* `GET /api/v1/reflections/{reflection_id}` - Get Reflection
* `PATCH /api/v1/reflections/{reflection_id}` - Update Reflection
* `DELETE /api/v1/reflections/{reflection_id}` - Delete Reflection

### Campaigns
* `GET /api/v1/campaigns` - List Campaigns
* `POST /api/v1/campaigns` - Create Campaign
* `GET /api/v1/campaigns/{campaign_id}` - Get Campaign
* `PATCH /api/v1/campaigns/{campaign_id}` - Update Campaign
* `DELETE /api/v1/campaigns/{campaign_id}` - Delete Campaign

### Message Templates
* `GET /api/v1/message-templates` - List Message Templates
* `POST /api/v1/message-templates` - Create Message Template
* `GET /api/v1/message-templates/{template_id}` - Get Message Template
* `PATCH /api/v1/message-templates/{template_id}` - Update Message Template
* `DELETE /api/v1/message-templates/{template_id}` - Delete Message Template

### Scripture Reflections
* `GET /api/v1/scripture-reflections` - List Scripture Reflections
* `POST /api/v1/scripture-reflections` - Create Scripture Reflection
* `GET /api/v1/scripture-reflections/{scripture_reflection_id}` - Get Scripture Reflection
* `PATCH /api/v1/scripture-reflections/{scripture_reflection_id}` - Update Scripture Reflection
* `DELETE /api/v1/scripture-reflections/{scripture_reflection_id}` - Delete Scripture Reflection
* `GET /api/v1/scripture-reflections/daily/{owner_profile_id}` - Get Daily Scripture Reflection

### Content Posts
* `POST /api/v1/content-posts` - Create Content Post
* `GET /api/v1/content-posts` - List Content Posts
* `GET /api/v1/content-posts/{content_post_id}` - Get Content Post
* `PATCH /api/v1/content-posts/{content_post_id}` - Update Content Post
* `DELETE /api/v1/content-posts/{content_post_id}` - Delete Content Post
* `POST /api/v1/content-posts/generate` - Generate Post
* `POST /api/v1/content-posts/{content_post_id}/approve` - Approve Content Post
* `POST /api/v1/content-posts/{content_post_id}/reject` - Reject Content Post
* `POST /api/v1/content-posts/{content_post_id}/mark-shared` - Mark Content Post Shared
* `GET /api/v1/content-posts/{content_post_id}/timeline` - Get Content Post Timeline

### Mobile API
* `GET /api/v1/mobile/handshake` - Mobile Handshake
* `GET /api/v1/mobile/heartbeat` - Mobile Heartbeat

### Financial Events & Invoices
* `POST /api/v1/financial-events` - Create Financial Event
* `GET /api/v1/financial-events/business/{business_owner_id}` - List Financial Events For Business
* `GET /api/v1/financial-events/business/{business_owner_id}/cash-replay` - Get Cash Replay
* `GET /api/v1/financial-events/business/{business_owner_id}/profit-snapshot` - Get Profit Snapshot
* `GET /api/v1/financial-events/business/{business_owner_id}/obligations` - Get Obligations
* `POST /api/v1/invoices/from-quote/{quote_id}` - Create Invoice From Quote

### Payments
* `GET /api/v1/payments/intents/business/{business_owner_id}` - List Payment Intents For Business
* `POST /api/v1/payments/intents` - Create Payment Intent
* `POST /api/v1/payments/intents/{payment_id}/receipt-upload` - Upload Payment Receipt
* `POST /api/v1/payments/intents/{payment_id}/proofs` - Submit Proof Of Payment
* `POST /api/v1/payments/intents/{payment_id}/verify` - Verify Payment Intent
* `POST /api/v1/payments/intents/{payment_id}/reject` - Reject Payment Intent
* `POST /api/v1/payments/intents/{payment_id}/receipt` - Issue Receipt
* `POST /api/v1/payments/{payment_id}/confirm-demo` - Confirm Demo Payment

### Inventory
* `POST /api/v1/inventory/items` - Create Inventory Item
* `POST /api/v1/inventory/items/{item_id}/add-stock` - Add Stock
* `POST /api/v1/inventory/items/{item_id}/consume-stock` - Consume Stock
* `GET /api/v1/inventory/business/{business_owner_id}/balances` - List Inventory Balances
* `GET /api/v1/inventory/items/{item_id}/replay` - Get Inventory Replay

### Commissions
* `GET /api/v1/commissions/business/{business_owner_id}/ledger` - Get Commission Ledger

### Core Engine APIs (Demand, Trust, Availability, Routing)
* `GET /api/v1/demand/feed` - Get Demand Feed
* `GET /api/v1/demand/preview` - Get Heatmap
* `POST /api/v1/trust/recalculate/{profile_id}` - Recalculate Trust
* `GET /api/v1/availability/{profile_id}` - Get Availability
* `GET /api/v1/routing/decide/{action_id}/{profile_id}` - Debug Routing Decision

### Telemetry & Drift
* `GET /api/v1/telemetry/system-health` - Get System Health
* `GET /api/v1/telemetry/fraud-summary` - Get Fraud Summary
* `GET /api/v1/telemetry/match-quality` - Get Match Quality
* `GET /api/v1/telemetry/demand-stability` - Get Demand Stability
* `GET /api/v1/telemetry/drift/` - Get Current Drift
* `POST /api/v1/simulations/start` - Start Simulation
* `POST /api/v1/simulations/stop` - Stop Simulation
* `GET /api/v1/simulations/status` - Get Status

### Action Delivery & Engagement
* `POST /api/v1/actions/dispatch` - Dispatch Actions
* `GET /api/v1/actions/inbox/{profile_id}` - Get Inbox
* `POST /api/v1/actions/{action_id}/deliver` - Deliver Action
* `POST /api/v1/engagement/events` - Create Engagement
* `GET /api/v1/engagement/feed/{profile_id}` - Get Engagement Feed
* `POST /api/v1/feedback/events` - Ingest Feedback

### Geo Match & Feed
* `GET /api/v1/match/opportunity/{opportunity_id}` - Match Opportunity
* `GET /api/v1/feed/geo` - Geo Feed

### Public Visibility
* `GET /api/v1/public/archetypes` - List Archetypes
* `GET /api/v1/public/archetypes/{archetype_key}` - Get Archetype
* `GET /api/v1/public/archetypes/{archetype_key}/templates` - Get Archetype Templates
* `GET /api/v1/public/opportunities` - Get Public Opportunities
* `GET /api/v1/public/business/{slug}` - Get Public Business Profile

### Leads & Admin
* `POST /api/v1/leads` - Create Lead
* `GET /api/v1/leads/me` - Get My Leads
* `PATCH /api/v1/leads/{lead_id}` - Update Lead Status
* `GET /api/v1/admin/dashboard` - Get Admin Dashboard
* `GET /api/v1/admin/profiles/payment-proofs` - List Payment Proofs
* `POST /api/v1/admin/profiles/{profile_id}/approve-payment` - Approve Payment
* `POST /api/v1/admin/profiles/{profile_id}/reject-payment` - Reject Payment
* `PATCH /api/v1/admin/profiles/{profile_id}/plan` - Update Profile Plan
* `GET /api/v1/admin/users` - List Users
* `POST /api/v1/admin/users/{profile_id}/promote-admin` - Promote Admin
* `POST /api/v1/admin/users/{profile_id}/demote-admin` - Demote Admin

### Categories & Giving
* `GET /api/v1/business-categories` - Get All Business Categories
* `GET /api/v1/business-categories/{category_key}` - Get Business Category By Key
* `GET /api/v1/giving/` - List Giving
* `POST /api/v1/giving/` - Create Giving
* `GET /api/v1/giving/{giving_id}` - Get Giving
* `PATCH /api/v1/giving/{giving_id}/status` - Update Giving Status

### Steward Utilities
* `GET /api/v1/steward-timeline/{business_owner_id}` - Read Steward Timeline
* `POST /api/v1/steward-annotations` - Add Steward Annotation
* `GET /api/v1/steward-annotations/event/{target_event_id}` - Get Annotations For Event
* `GET /api/v1/steward-console/export` - Export Steward Console

### Expenses
* `GET /api/v1/expenses/categories` - Get Categories
* `POST /api/v1/expenses` - Create Expense
* `GET /api/v1/expenses` - List Expenses
* `GET /api/v1/expenses/summary` - Get Expense Summary

### Sharing & Documents
* `GET /api/v1/share/profile/{profile_id}` - Share Profile
* `GET /api/v1/share/opportunity/{opportunity_id}` - Share Opportunity
* `GET /api/v1/share/quote/{quote_id}` - Share Quote
* `GET /api/v1/share/continuity-event/{event_id}` - Share Continuity Event
* `GET /api/v1/documents/quotes/{document_id}/pdf` - Download Quote Pdf
* `GET /api/v1/documents/invoices/{document_id}/pdf` - Download Invoice Pdf

### Continuity Events & Places
* `POST /api/v1/continuity-events/` - Create Event
* `GET /api/v1/continuity-events/` - List Events
* `GET /api/v1/continuity-events/{event_id}/graph` - Get Event Graph
* `GET /api/v1/continuity-events/entity/{entity_id}` - Get Events For Entity
* `GET /api/v1/continuity-events/business/{business_owner_id}` - Get Events For Business
* `GET /api/v1/continuity-events/parent/{event_id}/children` - Get Event Children
* `GET /api/v1/continuity-events/{event_id}` - Get Event
* `GET /api/v1/places/search` - Search Places
* `GET /api/v1/places/provinces` - Get Provinces
* `GET /api/v1/places/municipalities` - Get Municipalities
* `GET /api/v1/places/main-places` - Get Main Places
* `GET /api/v1/places/sub-places` - Get Sub Places
* `POST /api/v1/continuity-captures` - Create Capture
* `GET /api/v1/continuity-captures` - List Captures
* `GET /api/v1/continuity-captures/{capture_id}` - Read Capture

### River
* `POST /api/v1/river/event` - Receive River Event
* `GET /api/v1/river/replay` - Replay River
