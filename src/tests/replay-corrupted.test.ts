import { NodeMediaStore } from "../media/NodeMediaStore";
import { NodeMediaHasher } from "../media/NodeMediaHasher";
import { MediaPipeline } from "../media/MediaPipeline";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { LedgerService } from "../ledger/LedgerService";
import { CaptureService } from "../capture/CaptureService";
import { SyncQueue } from "../sync/SyncQueue";
import { ReplayService } from "../replay/ReplayService";
import { Observation } from "../types/Observation";
import * as fs from 'fs';
import * as path from 'path';

class CorruptingStorageAdapter extends AsyncStorageAdapter {
  // Hack to allow test to break the ledger
  async breakLedger(obsId: string) {
    const timeline = await this.loadTimeline();
    if (timeline.success) {
      const obs = timeline.data.find((o: Observation) => o.id === obsId);
      if (obs) {
        obs.content = "Hacked content"; // breaks the hash chain
        await this.saveObservation(obs);
      }
    }
  }
}

describe("Constitutional Test: Replay Corrupted", () => {
  const storePath = path.join(__dirname, '.test_replay_store_3');
  const tempFile = path.join(__dirname, 'temp_corrupt.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "original-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must detect ledger corruption AND media corruption independently", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const mediaPipeline = new MediaPipeline(store, hasher);

    const adapter = new CorruptingStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);
    const replayService = new ReplayService(ledger, store, hasher);

    const attachment = await mediaPipeline.processTempFile(
      tempFile,
      "obs-replay-corrupted",
      "media-replay-corrupt",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    await captureService.capture({
      id: "obs-replay-corrupted",
      type: "photo",
      content: "A memory that will be corrupted",
      metadata: { attachments: [attachment] }
    });

    // 1. Manually corrupt the media file bytes
    const physicalPath = await store.get(attachment.storageUri);
    fs.writeFileSync(physicalPath, "hacked-media-bytes");

    // 2. Manually corrupt the ledger
    await adapter.breakLedger("obs-replay-corrupted");

    // 3. Replay with 'shallow' policy first
    const shallowReplay = await replayService.replay("obs-replay-corrupted", "shallow");
    expect(shallowReplay.confidence.ledger).toBe("CORRUPTED");
    // Media was only shallowly checked, it exists, so overall is CORRUPTED due to ledger
    expect(shallowReplay.confidence.overall).toBe("CORRUPTED");

    // 4. Replay with 'deep' policy
    const deepReplay = await replayService.replay("obs-replay-corrupted", "deep");
    expect(deepReplay.confidence.ledger).toBe("CORRUPTED");
    expect(deepReplay.confidence.media).toBe("CORRUPTED");
    expect(deepReplay.confidence.overall).toBe("CORRUPTED");
    expect(deepReplay.evidence[0].isCorrupted).toBe(true);
  });
});