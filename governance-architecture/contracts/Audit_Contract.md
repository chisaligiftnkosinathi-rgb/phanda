# Audit Contract (v1.0.0)

## 1. Immutability
All audit logs are append-only.

## 2. Universal Schema
Every audit record must include:
- `timestamp`
- `actor_id` (from iPhande)
- `action`
- `target_resource`
- `epistemic_layer_source`
- `hash` (cryptographic link to previous record)

## 3. Transparency
Audit records must be accessible to World G (Constitution) at all times for compliance verification.
