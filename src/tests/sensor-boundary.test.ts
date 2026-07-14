import { CameraSensor, HardwareCameraDevice } from "../sensors/CameraSensor";
import { NodeMediaStore } from "../media/NodeMediaStore";
import { NodeMediaHasher } from "../media/NodeMediaHasher";
import { MediaPipeline } from "../media/MediaPipeline";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { LedgerService } from "../ledger/LedgerService";
import { CaptureService } from "../capture/CaptureService";
import { SyncQueue } from "../sync/SyncQueue";
import { Observation } from "../types/Observation";
import * as fs from 'fs';
import * as path from 'path';

// A perfectly functioning hardware device mock
class MockHardwareCamera implements HardwareCameraDevice {
  constructor(private tempUri: string) {}
  async takePictureAsync(options: any): Promise<{ uri: string; width: number; height: number; exif?: any }> {
    return { uri: this.tempUri, width: 1920, height: 1080 };
  }
}

// A hardware device that completely fails to take a picture (e.g. lens stuck, no permissions)
class FailingHardwareCamera implements HardwareCameraDevice {
  async takePictureAsync(options: any): Promise<{ uri: string; width: number; height: number; exif?: any }> {
    throw new Error("Hardware inaccessible");
  }
}

describe("Constitutional Test: Sensor Boundary", () => {
  const storePath = path.join(__dirname, '.test_sensor_store_1');
  const tempFile = path.join(__dirname, 'temp_sensor_shot.jpg');

  beforeAll(() => {
    fs.writeFileSync(tempFile, "fake-sensor-bytes");
  });

  afterAll(() => {
    fs.rmSync(storePath, { recursive: true, force: true });
    try { fs.unlinkSync(tempFile); } catch {}
  });

  it("must securely route a successful SensorResult through Media and Capture pipelines without ledger knowledge in the sensor", async () => {
    const store = new NodeMediaStore(storePath);
    const hasher = new NodeMediaHasher();
    const mediaPipeline = new MediaPipeline(store, hasher);

    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const queue = new SyncQueue();
    const captureService = new CaptureService(ledger, queue);

    const camera = new CameraSensor(new MockHardwareCamera(tempFile));

    // 1. Reality -> Sensor
    const sensorResult = await camera.capture();
    expect(sensorResult.tempUri).toBe(tempFile);

    // 2. SensorResult -> MediaPipeline
    const attachment = await mediaPipeline.processTempFile(
      sensorResult.tempUri!,
      "obs-sensor-1",
      "media-sensor-1",
      "photo",
      "image/jpeg",
      ".jpg"
    );

    // 3. MediaAttachment -> CaptureService
    const finalCapture = await captureService.capture({
      id: "obs-sensor-1",
      type: "photo",
      content: "A pure sensor capture",
      metadata: { attachments: [attachment] }
    });

    expect(finalCapture.success).toBe(true);

    // 4. Validate the ledger contains the evidence
    const timeline = await adapter.loadTimeline();
    expect(timeline.success).toBe(true);

    if (timeline.success) {
      const obs = timeline.data.find((o: Observation) => o.id === "obs-sensor-1");
      expect(obs).toBeDefined();

      const attachments = (obs?.metadata as any)?.attachments;
      expect(attachments[0].mediaId).toBe("media-sensor-1");
    }
  });

  it("must prevent hardware failures from polluting the ledger or media store", async () => {
    const adapter = new AsyncStorageAdapter();
    const ledger = new LedgerService(adapter);
    const store = new NodeMediaStore(storePath);

    const camera = new CameraSensor(new FailingHardwareCamera());

    await expect(camera.capture()).rejects.toThrow("Hardware inaccessible");

    // Ensure Ledger is empty
    const validation = await ledger.validate();
    expect(validation.observationCount).toBe(0);

    // Ensure Media Store didn't gain a phantom file
    const orphans = await store.listAll();
    // Assuming the store was populated by the previous test, we just check no *new* file was added,
    // but the previous test wrote exactly 1 file. Let me just assert length is exactly 1.
    expect(orphans.length).toBe(1); 
  });
});