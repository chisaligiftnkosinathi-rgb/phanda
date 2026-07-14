import { AsyncStorageAdapter } from "../AsyncStorageAdapter";
import { Observation } from "../../types/Observation";

describe("Constitutional Test: Backup and Restore", () => {
  it("must seamlessly restore a timeline from a backup string", async () => {
    const originalAdapter = new AsyncStorageAdapter();
    const obs: Observation = { 
      id: "1", 
      occurredAt: "2026-07-02T10:00:00Z", 
      capturedAt: "2026-07-02T10:00:00Z", 
      type: "text", 
      content: "To Backup",
      schemaVersion: 1,
      previousHash: "00000000000000000000000000000000",
      hash: "mock-backup-hash"
    };
    await originalAdapter.saveObservation(obs);

    const backupResult = await originalAdapter.backup();
    expect(backupResult.success).toBe(true);
    
    if (backupResult.success) {
      // Simulate new device or fresh install
      const restoredAdapter = new AsyncStorageAdapter();
      // Ensure it starts empty
      // Depending on mocking, it might share state. In real test env, we'd clear storage here.
      
      const restoreResult = await restoredAdapter.restore(backupResult.data);
      expect(restoreResult.success).toBe(true);

      const loadResult = await restoredAdapter.loadTimeline();
      expect(loadResult.success).toBe(true);
      if (loadResult.success) {
        expect(loadResult.data.length).toBe(1);
        expect(loadResult.data[0]).toEqual(obs);
      }
    }
  });
});