# Service Specifications (v1.0.0)

## Design Principles
Services must map directly to an Epistemic Layer. There are no "multi-layer" services. A service is either executing physical reality (World A) or computing meaning (World B), but never both simultaneously.

## Standard Method Signatures
To enforce layer separation, services must follow specific signature patterns.

### A+ (Legality Lattice)
`validateTransition(state: T, intent: Action): Result<void, HaltError>`
- Must run synchronously.
- Cannot mutate state.

### A (Execution)
`execute(mutation: M): Result<State, Error>`
- Only performs the mutation.
- Does not infer "why".

### B (Meaning)
`recordMeaning(contextId: ID, semanticData: BData): void`
- Returns void or success. Cannot block.

### G (Constitution)
`verifyCompliance(proposal: P): Result<void, ConstitutionalViolation>`
- Never overrides execution flow.
