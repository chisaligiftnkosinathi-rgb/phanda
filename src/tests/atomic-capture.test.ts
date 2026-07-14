import { CaptureService } from "../capture/CaptureService";
import { LedgerService } from "../ledger/LedgerService";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { SyncQueue } from "../sync/SyncQueue";

// Mock to simulate an internal crash exactly during write
class CrashingAdapter extends AsyncStorageAdapter {
  async saveObservation(obs: any): Promise<any> {
    throw new Error("Simulated hard crash before commit");
  }
}

describe("Constitutional Test: Atomic Capture Recovery", () => {
  it("must never leave a half-written observation in the ledger", async () => {
    const adapter = new CrashingAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);

    const result = await captureService.capture({
      id: "obs-partial",
      type: "text",
      content: "This will fail"
    });

    // 1. Capture itself reports failure
    expect(result.success).toBe(false);

    // 2. Validate that the ledger is still perfectly clean
    const validation = await ledger.validate();
    expect(validation.valid).toBe(true);

    const timeline = await adapter.loadTimeline();
    if (timeline.success) {
      expect(timeline.data.find(o => o.id === "obs-partial")).toBeUndefined();
    }
  });
});
