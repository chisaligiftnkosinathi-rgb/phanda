import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";

describe("Constitutional Test: Chronology", () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
  });

  it("must return observations in strictly ascending chronological order (occurredAt) regardless of insertion order", async () => {
    const obsA: Observation = { 
      id: "1", 
      occurredAt: "2026-07-02T10:00:00Z", 
      capturedAt: "2026-07-02T10:00:00Z", 
      type: "text", 
      content: "A",
      schemaVersion: 1,
      previousHash: "GENESIS",
      hash: "hash-a"
    };
    const obsB: Observation = { 
      id: "2", 
      occurredAt: "2026-07-02T11:00:00Z", 
      capturedAt: "2026-07-02T11:00:00Z", 
      type: "text", 
      content: "B",
      schemaVersion: 1,
      previousHash: "hash-a",
      hash: "hash-b"
    };
    const obsC: Observation = { 
      id: "3", 
      occurredAt: "2026-07-02T12:00:00Z", 
      capturedAt: "2026-07-02T12:00:00Z", 
      type: "text", 
      content: "C",
      schemaVersion: 1,
      previousHash: "hash-b",
      hash: "hash-c"
    };

    // Insert out of order
    await adapter.saveObservation(obsC);
    await adapter.saveObservation(obsA);
    await adapter.saveObservation(obsB);

    const loadResult = await adapter.loadTimeline();
    expect(loadResult.success).toBe(true);
    
    if (loadResult.success) {
      expect(loadResult.data.map(o => o.id)).toEqual(["1", "2", "3"]);
    }
  });
});