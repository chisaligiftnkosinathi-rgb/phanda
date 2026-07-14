# Trace Contract (v1.0.0)

## 1. Causal Lineage
No record in the system may exist in isolation. Every state mutation (World A) must contain a `causal_parent_id`.

## 2. Cross-Application Traceability
When an event in Phanda is triggered by an event in iSebenza, the causal lineage must bridge the applications. The trace identifier must be globally unique.

## 3. Epistemic Verification
A trace must be able to prove which Governance Layer permitted the transition.
