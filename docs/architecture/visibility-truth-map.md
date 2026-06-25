# Visibility Truth Map: Gating and Gaining Exposure

This document maps the architectural boundaries between what is hidden and what is exposed in the iPhande ecosystem, verifying how visibility flows from raw existence into community discovery.

---

## 1. The Visibility Boundary

### What is Visible?
* **Public Directories (`/public/profiles` & `/public/category/{archetype}`):** Stewards who are fully verified and have marked themselves active.
* **Public Steward Profile Details (`/public/{slug}`):** The steward's name, category, story bio, primary services list, availability status, general geographic coordinates (province, city, suburb), whatsapp number, and up to 5 proof of work images.
* **Public Opportunity Feed (`/public/opportunities`):** High-level client needs grouped by archetype, displaying general location and a whatsapp contact button.

### What is Hidden?
* **Unverified Stewards:** Any profile in `Draft` or `PendingVerification` onboarding states.
* **Private Ledgers:** Complete expense lists (`/expenses`), private cash statements (`/cash-replay`), and individual margins.
* **System Metrics:** System drift analysis (`/drift`), admin dashboards, and raw telemetry event rivers.
* **Hidden Profiles:** Verified stewards who manually toggle their visibility off due to workload or life disruption.

---

## 2. Why the Boundary Exists (The Rationale)

* **Preventing Memory Pollution (Spam Control):** If unverified users could list themselves immediately, fraud would dominate. Gating visibility behind a setup fee and validation review ensures only serious stewards enter.
* **Personal Security (Extortion Mitigation):** Informal traders operate in volatile neighborhoods. Publicly listing exact cash-flow amounts or precise house addresses makes stewards targets for local crime rings. Therefore, financial replay statements are strictly private, and spatial data is generalized to the suburb/ward level.
* **Disruption Protection (Burnout Gate):** Stewards face systemic shocks (load reduction, water shortages, illness). Manual visibility control allows them to disappear from the public directory instantly when capacity is compromised, protecting their reputation from uncompleted jobs.

---

## 3. The Transformation: Invisibility to Visibility

```text
Steward Draft Profile (Invisible)
    ↓
Submit Setup Fee Proof (Invisible)
    ↓
Admin Approves Receipt (Baseline Trust Initialized)
    ↓
Steward Status → Active (Manual toggle is_visible = true)
    ↓
Steward is Exposed to Public Directory (Visible)
```

---

## 4. End-to-End Flow Trace: Steward to Claimed Lead

To trace how economic memory propagates, here is the complete transaction flow:

### Step 1: The Steward Establishes Profile
* **User Action:** The steward edits their profile under [app/profile/settings.tsx](file:///C:/Projects/phanda/app/profile/settings.tsx) to list their category, suburb, and WhatsApp number.
* **API Invocations:** `PATCH /api/v1/profiles/me` sends the updated JSON schema to the server.
* **State/Memory Transition:** The profile transitions to `ActiveVisible` in the database.

### Step 2: The Customer Discovers Capability
* **User Action:** A customer visits the public directory [app/public/index.tsx](file:///C:/Projects/phanda/app/public/index.tsx), sets the mode to "Find People", clicks a trade category, and reviews the plumber's profile.
* **API Invocations:** 
  1. `GET /api/v1/public/archetypes` retrieves category list.
  2. `GET /api/v1/public/category/{archetype}` lists verified plumbers.
  3. `GET /api/v1/public/{slug}` fetches the chosen plumber's details and proof images.
* **UI Rendering:** The client displays the plumber's name, suburb, bio, and proof of work gallery.

### Step 3: The Need is Transformed to a Lead
* **User Action:** The customer fills out the contact request form on the plumber's profile screen (Name, Phone, Job description) and clicks "Send Request".
* **API Invocations:** `POST /api/v1/leads` sends the payload:
  ```json
  {
    "profile_slug": "john-plumber",
    "name": "Jane Customer",
    "phone": "0721112233",
    "message": "Burst pipe repair",
    "source": "public_profile"
  }
  ```
* **State/Memory Transition:** A new `Lead` object is created in the database and linked to the steward's profile ID.

### Step 4: The Steward Claims the Opportunity
* **User Action:** The plumber opens their dashboard inbox at [app/tabs/leads.tsx](file:///C:/Projects/phanda/app/tabs/leads.tsx) and views the incoming lead. They click "Claim Lead" and initiate contact.
* **API Invocations:**
  1. `GET /api/v1/leads/me` retrieves their list of leads.
  2. `PATCH /api/v1/leads/{lead_id}` updates the lead status to `claimed` or `contacted`.
* **State/Memory Transition:** The opportunity is locked to this steward. The digital memory records the successful match, feeding into the trust recalculation engine.
