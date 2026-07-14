import { NodeMediaStore } from "../media/NodeMediaStore";
import { NodeMediaHasher } from "../media/NodeMediaHasher";
import { MediaPipeline } from "../media/MediaPipeline";
import { MediaValidator } from "../media/MediaValidator";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { LedgerService } from "../ledger/LedgerService";
import { CaptureService } from "../capture/CaptureService";
import { SyncQueue } from "../sync/SyncQueue";
import { Observation } from "../types/Observation";
import * as fs from 'fs';
import * as path from 'path';

describe("Constitutional Test: Attachment Integrity", () => {
  const storePath = path.join(__dirname, '.test_media_store_1');
  const tempFile = path.join(__dirname, 'temp_image.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "fake-image-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    fs.unlinkSync(tempFile);
  });

  it("must securely store a media file and verify its integrity against the ledger", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const pipeline = new MediaPipeline(store, hasher);
    const validator = new MediaValidator(store, hasher);

    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);

    // 1. Process Media
    const attachment = await pipeline.processTempFile(
      tempFile,
      "obs-123",
      "media-999",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    // 2. Capture Observation referencing the attachment
    const result = await captureService.capture({
      id: "obs-123",
      type: "photo",
      content: "Captured a photo",
      metadata: { attachments: [attachment] }
    });

    expect(result.success).toBe(true);

    // 3. Verify Ledger remains pure (Metadata contains attachment)
    const timeline = await adapter.loadTimeline();
    expect(timeline.success).toBe(true);

    if (timeline.success) {
      const savedObs = timeline.data.find((o: Observation) => o.id === "obs-123");
      expect(savedObs).toBeDefined();

      const attachments = (savedObs?.metadata as any)?.attachments;
      expect(attachments[0].checksum).toBe(attachment.checksum);

      // 4. Validate physical media (simulating Replay open)
      await expect(validator.validate(attachments[0])).resolves.not.toThrow();
    }
  });
});