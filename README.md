# iPhande Mobile OS

iPhande is a mobile platform built using React Native and Expo, designed to empower local business owners ("stewards") by providing them with tools for client interaction, opportunity identification, lead management, and instant, professional quote generation.

The mobile client is connected to a live Railway-backed REST API and utilizes Supabase for secure authentication and cloud storage.

---

## 🚀 Getting Started

### 1. Prerequisite Setup
Ensure you have Node.js (v18+) and npm installed.

### 2. Configure Environment
Copy the env template to `.env` in the root of the project:
```bash
cp .env.example .env
```
Fill in the correct values for your environment. For testing against the live staging environment, obtain the Railway API base URL and Supabase Anon keys.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run metro bundler
```bash
npx expo start -c
```
Press `w` to open in your web browser, or connect via an Android emulator or iOS simulator.

---

## 🛠 Useful Commands

- **Start Bundler**: `npx expo start -c`
- **TypeScript Gate Check**: `npx tsc --noEmit`
- **Lint Code**: `npm run lint` (or `npx expo lint`)
- **Run Architectural Audit**: `python scripts/audit_architecture.py`

---

## 📐 Architecture & Governance

The project strictly follows a **clean architecture** model that separates raw backend DTO data from the frontend UI views.

For complete documentation:
- 📖 [**Architecture Guide**](file:///C:/Projects/phanda/ARCHITECTURE.md): Explains the directory structures, Feature Module Grammar, DTO Isolation, and Aggregate vs View Model separation.
- 📜 [**Platform Constitution**](file:///C:/Projects/phanda/governance-architecture/PLATFORM_CONSTITUTION.md): The normative ruleset governing feature design, code structure, and cache boundaries.

---

## 🟢 Current Project Status (v1.0.0-connected)

The **iPhande v1 Connected & Stabilized** milestone has been achieved. The following core engines are fully completed, connected to the backend API, and strictly audited:

1. **Authentication Engine**: Sign-in, sign-up, session persistence, dynamic tokens, and secure auth state management.
2. **Business Engine**: Profile management, category matching, service radius, and operating area updates.
3. **Dashboard Engine**: Aggregates business state to display trust levels, client wallet sizes, and active jobs.
4. **Opportunity Engine**: Create, edit, publish, and explore public/private local work opportunities.
5. **Lead Engine**: Capture public customer requests and advance them through the inbox pipeline.
6. **Quote Engine**: Professional quote generator (estimate labour, materials, travel cost, and VAT) with direct conversion to invoices.
