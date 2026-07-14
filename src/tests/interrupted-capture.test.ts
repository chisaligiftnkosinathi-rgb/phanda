import { NodeMediaStore } from "../media/NodeMediaStore";
import { NodeMediaHasher } from "../media/NodeMediaHasher";
import { MediaPipeline } from "../media/MediaPipeline";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { LedgerService } from "../ledger/LedgerService";
import { CaptureService } from "../capture/CaptureService";
import { SyncQueue } from "../sync/SyncQueue";
import * as fs from 'fs';
import * as path from 'path';

// Mock adapter that throws to simulate interrupted write
class InterruptedAdapter extends AsyncStorageAdapter {
  async saveObservation(obs: any): Promise<any> {
    throw new Error("Power loss during ledger commit");
  }
}

describe("Constitutional Test: Interrupted Capture", () => {
  const storePath = path.join(__dirname, '.test_media_store_4');
  const tempFile = path.join(__dirname, 'temp_interrupted.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "interrupted-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must prevent the ledger from recording a half-completed observation if power is lost post-media-store", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const pipeline = new MediaPipeline(store, hasher);

    const adapter = new InterruptedAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);

    const attachment = await pipeline.processTempFile(
      tempFile,
      "obs-interrupted-2",
      "media-interrupted-2",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    // This will simulate the crash
    const result = await captureService.capture({
      id: "obs-interrupted-2",
      type: "photo",
      content: "Photo observation",
      metadata: { attachments: [attachment] }
    });

    expect(result.success).toBe(false);

    // The Ledger MUST NOT contain the observation
    const validation = await ledger.validate();
    expect(validation.valid).toBe(true); // The ledger is still pure and valid
    
    // The attachment physical file exists on disk, but the ledger doesn't know about it.
    // It will be cleaned up by the Garbage Collector on the next boot.
    const exists = await store.exists(attachment.storageUri);
    expect(exists).toBe(true);
  });
});
