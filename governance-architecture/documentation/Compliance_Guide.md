# Compliance Guide (v1.0.0)

Every application built in this ecosystem must include a `governance-manifest.yml` at its root.
This manifest explicitly declares the application's compatibility with a specific Governance Architecture version (e.g. `1.0.0`).

During CI/CD, the compliance checker will read this manifest and run static analysis to ensure:
- Service boundaries aren't crossed.
- Direct database writes bypass A+ protections.
- Identity tokens are validated via iPhande.
