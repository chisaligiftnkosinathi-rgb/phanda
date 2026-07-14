# Phanda Migration Checklist

This document tracks the end-to-end migration status of the Phanda platform, aligning system capability with our canonical business laws.

## Infrastructure
* [x] Runtime Shell Restored
* [x] Routing
* [x] Environment Variables
* [ ] Authentication
* [ ] API Connectivity

## Canonical Loops (Business Logic Verification)

| Status | Canonical Law | Primary Screens | Description |
|--------|--------------|-----------------|-------------|
| ⏳ | **Visibility** | `app/public/explore.tsx`, `app/public/[slug].tsx` | Public profiles load correctly |
| ⏳ | **Opportunity** | `app/opportunities/`, `app/tabs/leads.tsx` | Leads can be created and retrieved |
| ⏳ | **Evidence** | `app/quotes/`, `app/jobs/[id]/proof.tsx` | Quotes and proof-of-work flow execute successfully |
| ⏳ | **Trust** | Profile/admin flows | Trust recalculation completes and updates accurately |
| ⏳ | **Continuity** | `app/tools/` | Continuity events are recorded to the ledger |
| ⏳ | **Grace** | `app/support/` | Support flow behaves as expected and routes correctly |
