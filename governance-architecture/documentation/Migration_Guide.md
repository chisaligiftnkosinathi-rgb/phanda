# Migration Guide (v1.0.0)

When Governance Architecture bumps a version (e.g. `v1.0.0` -> `v1.1.0`), applications do NOT automatically upgrade. 

To migrate:
1. Review the Governance Changelog.
2. Ensure no execution paths violate new constitutional rules.
3. Update the `governance_version` in the application's `governance-manifest.yml`.
4. Re-run the compliance audit.
