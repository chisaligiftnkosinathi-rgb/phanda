# Event Specifications (v1.0.0)

## Epistemic Event Sourcing
Events in the Phanda ecosystem are strictly immutable and append-only (Article III).

### Event Envelopes
Every emitted event must specify the Epistemic Layer of origin.

```json
{
  "eventId": "evt_001",
  "sourceLayer": "A",
  "domain": "phanda",
  "action": "QUOTE_ACCEPTED",
  "actorId": "usr_gift",
  "timestamp": "2026-07-01T00:00:00Z",
  "payload": {
    "quoteId": "Q-105"
  }
}
```

### Emitting Rules
- **World A** emits Execution Events.
- **World B** emits Meaning Events.
- **World C+** emits Node Link Events.
- **World F** emits Arbitration Events.
- **World G** emits Violation Events.
