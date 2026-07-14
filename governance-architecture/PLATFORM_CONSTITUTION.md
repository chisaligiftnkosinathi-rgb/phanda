# Phanda Platform Constitution

This document serves as the normative architectural authority for the Phanda OS frontend platform. It defines *what* the platform requires.

All generated code, migrations, and feature implementations must conform to this Constitution and its referenced implementation standards.

## 1. Feature Module Grammar
The platform is composed of isolated, self-contained business domains (feature modules).
- **Rule:** Every domain MUST strictly adhere to the feature module grammar, encapsulating its types, mappers, and hooks.
- **Reference:** [`archive/PLATFORM_BASELINE_1.0.md`](file:///C:/Projects/phanda/governance-architecture/archive/PLATFORM_BASELINE_1.0.md) (Section 1)

## 2. Aggregate & View Model Separation
The application relies on Domain-Driven Design principles.
- **Rule:** Domains MUST be modelled as Aggregate Roots. Screens MUST only receive View Models projected from these aggregates via pure function mappers. Aggregates and DTOs MUST NEVER be passed directly to screens.
- **Reference:** [`archive/PLATFORM_BASELINE_1.0.md`](file:///C:/Projects/phanda/governance-architecture/archive/PLATFORM_BASELINE_1.0.md) (Sections 2 & 3)

## 3. DTO Isolation
Network Data Transfer Objects (DTOs) are strictly bounded.
- **Rule:** Screen components and hooks MUST NOT import DTO types (`src/generated/models/*`) or network clients (`src/generated/api.ts`). DTOs exist exclusively at the network boundary and are consumed only by Mappers.
- **Reference:** [`archive/PLATFORM_BASELINE_1.0.md`](file:///C:/Projects/phanda/governance-architecture/archive/PLATFORM_BASELINE_1.0.md) (Section 6)

## 4. Cross-Domain Cache Management
The platform relies on React Query for server state management.
- **Rule:** All mutations MUST strictly invalidate cache keys according to the defined cache contract to prevent stale data and over-fetching, particularly regarding cross-domain projections like `dashboard` and `bootstrap`.
- **Reference:** [`CACHE_CONTRACT.md`](file:///C:/Projects/phanda/governance-architecture/CACHE_CONTRACT.md)

## 5. Domain Readiness
A feature module is not considered architecturally complete until it meets all operational and structural criteria.
- **Rule:** All feature modules SHALL satisfy the Domain Readiness Checklist before being integrated into the main workflow.
- **Reference:** [`DOMAIN_READINESS_CHECKLIST.md`](file:///C:/Projects/phanda/governance-architecture/DOMAIN_READINESS_CHECKLIST.md)

## 6. Architectural Decision Records (ADRs)
*Pending: After the stabilization milestone, a formal ADR index will be introduced to document the **why** behind these constitutional rules.*
