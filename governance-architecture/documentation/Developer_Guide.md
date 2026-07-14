# Developer Guide (v1.0.0)

When building an application (e.g. Phanda, AXIONYX) in this ecosystem:
1. Do not implement your own authentication. Direct users to iPhande.
2. Store only `iphande_identity_id` in your local database.
3. Every database table mutation must be guarded by a World A+ legality check.
4. Log every mutation to the World C+ trace ledger.
