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

describe("Constitutional Test: Checksum Validation", () => {
  const storePath = path.join(__dirname, '.test_media_store_3');
  const tempFile = path.join(__dirname, 'temp_corrupt.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "original-clean-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must fail media validation but preserve the observation if physical disk is corrupted", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const pipeline = new MediaPipeline(store, hasher);
    const validator = new MediaValidator(store, hasher);

    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);

    const attachment = await pipeline.processTempFile(
      tempFile,
      "obs-corrupt",
      "media-corrupt",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    await captureService.capture({
      id: "obs-corrupt",
      type: "photo",
      content: "Photo observation",
      metadata: { attachments: [attachment] }
    });

    // Manually corrupt the physical file on disk years later
    const physicalPath = await store.get(attachment.storageUri);
    fs.writeFileSync(physicalPath, "hacked-malicious-bytes");

    // 1. The Ledger is totally perfectly intact
    const timeline = await adapter.loadTimeline();
    expect(timeline.success).toBe(true);

    if (timeline.success) {
      const savedObs = timeline.data.find((o: Observation) => o.id === "obs-corrupt");
      expect(savedObs).toBeDefined();

      const attachments = (savedObs?.metadata as any)?.attachments;

      // 2. Media Validator explicitly flags the corruption
      await expect(validator.validate(attachments[0])).rejects.toThrow(/Checksum mismatch/);
    }
  });
});