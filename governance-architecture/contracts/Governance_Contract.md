# Governance Contract (v1.0.0)

## 1. Compliance Reporting
All applications in the ecosystem must expose a `/governance/compliance` endpoint that returns their real-time alignment with the Governance Architecture.

## 2. Layer Separation Guarantees
Each application must logically or physically separate execution code (World A) from observation code (World C, C+).

## 3. Human Intent Trace
No automated action can occur without an unbroken chain tracing back to a Human Intent binding (World E).
