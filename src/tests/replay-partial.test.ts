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

describe("Constitutional Test: Replay Partial", () => {
  const storePath = path.join(__dirname, '.test_replay_store_2');
  const tempFile = path.join(__dirname, 'temp_missing.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "soon-to-be-missing-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must reconstruct the observation perfectly but explicitly report PARTIAL confidence if media is missing", async () => {
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
      "obs-replay-partial",
      "media-replay-missing",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    await captureService.capture({
      id: "obs-replay-partial",
      type: "photo",
      content: "Memory of a deleted photo",
      metadata: { attachments: [attachment] }
    });

    // 1. Manually delete the physical evidence to simulate disk failure / garbage collection
    const actualPath = await store.get(attachment.storageUri);
    fs.unlinkSync(actualPath);

    // 2. Replay with shallow policy
    const shallowReplay = await replayService.replay("obs-replay-partial", "shallow");
    
    // The observation data MUST still exist and be accurate
    expect(shallowReplay.content).toBe("Memory of a deleted photo");
    
    // Confidence MUST reflect reality
    expect(shallowReplay.confidence.ledger).toBe("VERIFIED");
    expect(shallowReplay.confidence.media).toBe("MISSING");
    expect(shallowReplay.confidence.overall).toBe("PARTIAL");
    expect(shallowReplay.evidence[0].isMissing).toBe(true);
  });
});
