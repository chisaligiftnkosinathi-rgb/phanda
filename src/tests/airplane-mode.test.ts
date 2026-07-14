import { CaptureService } from "../capture/CaptureService";
import { LedgerService } from "../ledger/LedgerService";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { SyncQueue } from "../sync/SyncQueue";
import { SyncWorker } from "../sync/SyncWorker";
import { SyncTransport } from "../sync/SyncTransport";
import { Observation } from "../types/Observation";

// Dummy Transport to simulate airplane mode (always fails)
class AirplaneTransport implements SyncTransport {
  async upload(observation: Observation): Promise<boolean> {
    return false; // Network unavailable
  }
}

describe("Constitutional Test: Airplane Mode Capture", () => {
  it("must securely record an observation into the immutable ledger even if the network fails", async () => {
    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const transport = new AirplaneTransport();
    const worker = new SyncWorker(queue, transport, adapter);
    
    const captureService = new CaptureService(ledger, queue);

    const result = await captureService.capture({
      id: "obs-offline",
      type: "text",
      content: "Captured in a tunnel"
    });

    // 1. Capture must succeed instantly
    expect(result.success).toBe(true);

    // 2. Ledger must contain it
    const loadResult = await adapter.loadTimeline();
    expect(loadResult.success).toBe(true);
    if (loadResult.success) {
      expect(loadResult.data.find(o => o.id === "obs-offline")).toBeDefined();
    }

    // 3. Queue must contain it
    const pending = await queue.getPending();
    expect(pending.find(p => p.observationId === "obs-offline")).toBeDefined();

    // 4. Try Syncing (it will fail because airplane mode)
    await worker.wakeAndProcess();

    // 5. Status should be NEEDS_ATTENTION, but ledger is still perfectly safe
    const updatedQueue = await queue.getQueue();
    const syncRecord = updatedQueue.find(q => q.observationId === "obs-offline");
    expect(syncRecord?.status).toBe("NEEDS_ATTENTION");
  });
});
