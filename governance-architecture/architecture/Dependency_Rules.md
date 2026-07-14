# Dependency Rules (v1.0.0)

## The Core Rule: Epistemic Unidirectionality
Lower layers (A+, A, B) may never import, query, or depend upon the output of Higher layers (C, D, E, F, G).
Higher layers observe and query Lower layers.

## Rule Definitions

1. **A+ (Legality Lattice) Dependencies**
   - **Depends On**: Absolute constitutional baseline (G) *only for identity definition*, but operationally runs entirely offline, depending only on the local execution payload.
   - **Prohibited**: A+ may NOT depend on meaning (B), patterns (C), simulations (D), intent (E).

2. **A (Execution) Dependencies**
   - **Depends On**: A+ (must pass through Legality Lattice).
   - **Prohibited**: B, C, D, E, F, G. Execution does not care *why* it executes.

3. **B (Meaning) Dependencies**
   - **Depends On**: A (the event that occurred).
   - **Prohibited**: C, D, E, F, G. Meaning is contextual to the event, not to the system's meta-governance.

4. **D (Evolution) Dependencies**
   - **Depends On**: C++ (Tension).
   - **Prohibited**: Cannot inject output back into A+ without F (Arbitration) intervention.

5. **F (Arbitration) Dependencies**
   - **Depends On**: A+, C++, D, E.
   - **Prohibited**: F cannot generate new choices, it only depends on the frozen choices presented by lower layers.
