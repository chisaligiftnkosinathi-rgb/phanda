# API Coverage Matrix

This Operational Readiness Dashboard tracks the architecture migration state.
For a domain to be fully operational, it must pass through every layer of the established architecture (FMS-001).

| Domain      | Backend | Generated | Mapper | Hook | UI | Tested |
| ----------- | ------- | --------- | ------ | ---- | -- | ------ |
| Bootstrap   | ✅       | ✅         | ✅      | ✅    | ✅  | ✅      |
| Dashboard   | ✅       | ✅         | ✅      | ✅    | ✅  | ✅      |
| Business    | ✅       | ✅         | ✅      | ✅    | ✅  | ✅      |
| Opportunity | ✅       | ✅         | ✅      | ✅    | ✅  | ✅      |
| Timeline    | ✅       | ✅         | ✅      | ✅    | ✅  | ✅      |
| Discovery   | ⏳       | ⏳         | ⏳      | ⏳    | ⏳  | ⏳      |
| Lead        | ⏳       | ⏳         | ⏳      | ⏳    | ⏳  | ⏳      |
| Quote       | ⏳       | ⏳         | ⏳      | ⏳    | ⏳  | ⏳      |

**Layers Definition:**
- **Backend**: Endpoint exists in the live server OpenAPI schema.
- **Generated**: `npx orval` successfully generates the typed hooks.
- **Mapper**: Frontend transforms raw DTOs into ViewModels/Aggregates.
- **Hook**: Command-oriented React Query hooks encapsulate the mutation/query.
- **UI**: Components strictly use ViewModels via custom hooks (no direct DTO/Orval imports).
- **Tested**: Passes compilation `tsc`, cache audit, and full user journey tests.
