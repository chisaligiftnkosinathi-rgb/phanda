import { NodeMediaStore } from "../media/NodeMediaStore";
import { NodeMediaHasher } from "../media/NodeMediaHasher";
import { MediaPipeline } from "../media/MediaPipeline";
import { MediaGarbageCollector } from "../media/MediaGarbageCollector";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import * as fs from 'fs';
import * as path from 'path';

describe("Constitutional Test: Orphan Detection", () => {
  const storePath = path.join(__dirname, '.test_media_store_2');
  const tempFile = path.join(__dirname, 'temp_orphan.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "orphan-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must detect and clean files that were stored but never committed to the ledger", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const pipeline = new MediaPipeline(store, hasher);
    const adapter = new AsyncStorageAdapter();
    const gc = new MediaGarbageCollector(store, adapter);

    // 1. Write the file to the MediaStore
    await pipeline.processTempFile(
      tempFile,
      "obs-interrupted",
      "media-orphan",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    // 2. CRASH - We purposefully DO NOT call CaptureService/LedgerService.

    // 3. Run Garbage Collector
    const orphans = await gc.findOrphans();
    
    expect(orphans.length).toBe(1);
    expect(orphans[0]).toContain("media-orphan.jpg");

    // 4. Clean
    await gc.cleanOrphans();
    const postCleanOrphans = await gc.findOrphans();
    expect(postCleanOrphans.length).toBe(0);
  });
});
