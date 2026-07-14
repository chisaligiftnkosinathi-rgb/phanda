import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";

describe("Constitutional Test: Replay Fidelity", () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    adapter = new AsyncStorageAdapter();
  });

  it("must handle a bulk set of observations and retrieve them perfectly", async () => {
    const observations: Observation[] = Array.from({ length: 100 }, (_, i) => ({
      id: `obs-${i}`,
      occurredAt: `2026-07-02T10:${i.toString().padStart(2, '0')}:00Z`,
      capturedAt: `2026-07-02T10:${i.toString().padStart(2, '0')}:05Z`,
      type: "text",
      content: `Content ${i}`,
      schemaVersion: 1,
      previousHash: i === 0 ? "GENESIS" : `hash-${i - 1}`,
      hash: `hash-${i}`
    }));

    for (const obs of observations) {
      await adapter.saveObservation(obs);
    }

    const loadResult = await adapter.loadTimeline();
    expect(loadResult.success).toBe(true);
    
    if (loadResult.success) {
      expect(loadResult.data.length).toBe(100);
      expect(loadResult.data).toEqual(observations);
    }
  });
});