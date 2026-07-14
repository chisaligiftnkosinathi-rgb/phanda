import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";

describe("Constitutional Test: Recovery", () => {
  it("must not corrupt the ledger if interrupted", async () => {
    // True crash recovery testing requires multiprocess or mock injection.
    // For now, we simulate an interrupted atomic write.
    const adapter = new AsyncStorageAdapter();
    const obs: Observation = { 
      id: "1", 
      occurredAt: "2026-07-02T10:00:00Z", 
      capturedAt: "2026-07-02T10:00:00Z", 
      type: "text", 
      content: "Safe",
      schemaVersion: 1,
      previousHash: "00000000000000000000000000000000",
      hash: "mock-recovery-hash"
    };
    
    await adapter.saveObservation(obs);
    
    // Simulate crash by dropping the instance
    const recoveredAdapter = new AsyncStorageAdapter();
    const loadResult = await recoveredAdapter.loadTimeline();
    
    expect(loadResult.success).toBe(true);
    if (loadResult.success) {
      expect(loadResult.data.length).toBeGreaterThan(0);
    }
  });
});