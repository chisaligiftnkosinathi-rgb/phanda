# Identity Lifecycle (v1.0.0)

## 1. Registration (iPhande)
- Human entity provides verifiable credentials.
- iPhande mints a single, globally unique Identity ID.

## 2. Authorization (Domain Applications)
- Applications request access to the Identity.
- Identity grants localized permission roles (e.g. "Technician in Phanda").

## 3. Propagation
- Identity state changes (e.g. email update, password reset) happen strictly in iPhande.
- Changes propagate downstream to all consuming applications automatically.

## 4. Deletion / Archival
- Archiving an identity cascades a freeze command to all linked accounts across the ecosystem.
