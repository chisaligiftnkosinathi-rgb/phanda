import { NodeMediaStore } from "../media/NodeMediaStore";
import { NodeMediaHasher } from "../media/NodeMediaHasher";
import { MediaPipeline } from "../media/MediaPipeline";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { LedgerService } from "../ledger/LedgerService";
import { CaptureService } from "../capture/CaptureService";
import { SyncQueue } from "../sync/SyncQueue";
import { ReplayService } from "../replay/ReplayService";
import * as fs from 'fs';
import * as path from 'path';

describe("Constitutional Test: Replay Verified", () => {
  const storePath = path.join(__dirname, '.test_replay_store_1');
  const tempFile = path.join(__dirname, 'temp_replay.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "perfect-observation-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must accurately reconstruct a verified observation under both shallow and deep policies", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const mediaPipeline = new MediaPipeline(store, hasher);

    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);
    const replayService = new ReplayService(ledger, store, hasher);

    const attachment = await mediaPipeline.processTempFile(
      tempFile,
      "obs-replay-1",
      "media-replay-1",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    await captureService.capture({
      id: "obs-replay-1",
      type: "photo",
      content: "A flawless memory",
      metadata: { attachments: [attachment] }
    });

    // 1. Shallow Policy (Default)
    const shallowReplay = await replayService.replay("obs-replay-1", "shallow");
    expect(shallowReplay.confidence.ledger).toBe("VERIFIED");
    expect(shallowReplay.confidence.media).toBe("VERIFIED");
    expect(shallowReplay.confidence.overall).toBe("VERIFIED");
    expect(shallowReplay.evidence[0].isMissing).toBe(false);
    expect(shallowReplay.evidence[0].isCorrupted).toBe(false);

    // 2. Deep Policy (Audit)
    const deepReplay = await replayService.replay("obs-replay-1", "deep");
    expect(deepReplay.confidence.ledger).toBe("VERIFIED");
    expect(deepReplay.confidence.media).toBe("VERIFIED");
    expect(deepReplay.confidence.overall).toBe("VERIFIED");
    expect(deepReplay.evidence[0].isMissing).toBe(false);
    expect(deepReplay.evidence[0].isCorrupted).toBe(false);
  });
});
