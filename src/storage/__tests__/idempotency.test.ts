import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";

describe("Constitutional Test: Idempotency", () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
  });

  it("must accept exact duplicate payloads safely without duplicating the timeline entry", async () => {
    const obs: Observation = { 
      id: "1", 
      occurredAt: "2026-07-02T10:00:00Z", 
      capturedAt: "2026-07-02T10:00:00Z", 
      type: "text", 
      content: "Duplicate Me",
      schemaVersion: 1,
      previousHash: "00000000000000000000000000000000",
      hash: "mock-idempotency-hash"
    };
    
    const result1 = await adapter.saveObservation(obs);
    expect(result1.success).toBe(true);

    const result2 = await adapter.saveObservation(obs);
    expect(result2.success).toBe(true);

    const loadResult = await adapter.loadTimeline();
    expect(loadResult.success).toBe(true);
    
    if (loadResult.success) {
      // Should still only be 1 observation
      expect(loadResult.data.length).toBe(1);
    }
  });
});