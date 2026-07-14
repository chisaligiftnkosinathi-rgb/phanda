import { CaptureService } from "../capture/CaptureService";
import { LedgerService } from "../ledger/LedgerService";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { SyncQueue } from "../sync/SyncQueue";

describe("Constitutional Test: Rapid Capture", () => {
  it("must successfully capture 100 observations sequentially without race conditions or hash chain breaks", async () => {
    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);

    const promises = [];
    for (let i = 0; i < 100; i++) {
      // Intentionally awaiting in sequence to simulate rapid firing. 
      // If we fired Promise.all, AsyncStorage might trip over itself without a lock,
      // but the Capture Pipeline should serialize writes through LedgerService eventually.
      // For Alpha, we await to ensure strict ordering, but simulate fast execution.
      promises.push(captureService.capture({
        id: `rapid-${i}`,
        type: "text",
        content: `Rapid Content ${i}`
      }));
    }

    // Wait for all
    const results = await Promise.all(promises);
    expect(results.every(r => r.success)).toBe(true);

    // Validate the Ledger Pipeline confirms the Hash Chain is 100% intact
    const validation = await ledger.validate();
    expect(validation.valid).toBe(true);
    expect(validation.observationCount).toBe(100);
  });
});
