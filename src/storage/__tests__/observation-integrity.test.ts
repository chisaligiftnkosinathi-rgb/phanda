import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";

describe("Constitutional Test: Observation Integrity", () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
    // In a real environment, we'd mock or clear AsyncStorage here
  });

  it("must preserve an observation byte-for-byte across save and load", async () => {
    const obs: Observation = {
      id: "obs-123",
      occurredAt: "2026-07-02T10:00:00Z",
      capturedAt: "2026-07-02T10:00:01Z",
      type: "text",
      content: "The geyser is leaking.",
      metadata: { location: "Basement" },
      schemaVersion: 1,
      previousHash: "00000000000000000000000000000000",
      hash: "mock-integrity-hash"
    };

    const saveResult = await adapter.saveObservation(obs);
    expect(saveResult.success).toBe(true);

    const loadResult = await adapter.loadTimeline();
    expect(loadResult.success).toBe(true);
    
    if (loadResult.success) {
      expect(loadResult.data.length).toBe(1);
      expect(loadResult.data[0]).toEqual(obs);
    }
  });
});