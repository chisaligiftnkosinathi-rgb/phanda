import { EngineEventEmitter } from "./EngineEvents";
import { AsyncStorageAdapter } from "../storage/AsyncStorageAdapter";
import { LedgerService } from "../ledger/LedgerService";
import { SyncQueue } from "../sync/SyncQueue";
import { CaptureService } from "../capture/CaptureService";
import { MediaPipeline } from "../media/MediaPipeline";
import { MediaStore } from "../media/MediaStore";
import { MediaHasher } from "../media/MediaHasher";
import { StorageAdapter } from "../storage/StorageAdapter";
import { ReplayService } from "../replay/ReplayService";
import { SensorResult } from "../sensors/SensorResult";
import { ReplayRecord, VerificationPolicy } from "../replay/ReplayRecord";

/**
 * The Facade over the General Observation Engine.
 * This is the ONLY object the UI or external applications should interact with.
 * It translates domain logic into simple async commands and reactive events.
 */
export class PhandaEngine {
  public readonly events = new EngineEventEmitter();

  private ledger: LedgerService;
  private queue: SyncQueue;
  private captureService: CaptureService;
  private mediaPipeline: MediaPipeline;
  private replayService: ReplayService;

  constructor(
    storageAdapter: StorageAdapter,
    mediaStore: MediaStore,
    hasher: MediaHasher
  ) {
    // 1. Initialize Core Services with Injected Adapters
    this.ledger = new LedgerService(storageAdapter);
    this.queue = new SyncQueue();
    this.mediaPipeline = new MediaPipeline(mediaStore, hasher);
    this.replayService = new ReplayService(this.ledger, mediaStore, hasher);
    this.captureService = new CaptureService(this.ledger, this.queue);
  }

  // --- CAPTURE API ---

  /**
   * Accepts a pure SensorResult, pipes it through Media, captures the observation,
   * and notifies the application.
   */
  async captureFromSensor(
    sensorResult: SensorResult,
    observationContent: string,
    injectedTimestamp?: number
  ): Promise<string> {
    const ts = injectedTimestamp ?? 0;
    const observationId = `obs-${ts}`;
    const attachments = [];

    // Process media if the sensor produced any binary media (not text/location)
    if (sensorResult.tempUri && (sensorResult.type === 'photo' || sensorResult.type === 'audio' || sensorResult.type === 'document')) {
      const mediaId = `media-${ts}`;
      const fileExt = sensorResult.tempUri.substring(sensorResult.tempUri.lastIndexOf('.')) || '';
      
      const attachment = await this.mediaPipeline.processTempFile(
        sensorResult.tempUri,
        observationId,
        mediaId,
        sensorResult.type,
        sensorResult.mimeType || "application/octet-stream",
        fileExt
      );
      attachments.push(attachment);
    }

    // Capture into the immutable ledger
    const result = await this.captureService.capture({
      id: observationId,
      type: sensorResult.type,
      content: observationContent,
      metadata: { attachments }
    });

    if (!result.success) {
      throw new Error("Failed to capture observation to ledger");
    }

    // Emit reactive events for the UI
    this.events.emit("ObservationCaptured", { observationId });
    this.events.emit("TimelineUpdated", undefined);

    return observationId;
  }

  // --- REPLAY API ---

  /**
   * Retrieves the full timeline. Useful for initial load.
   */
  async getTimeline(policy: VerificationPolicy = "shallow"): Promise<ReplayRecord[]> {
    const timeline = await this.ledger.getTimeline();
    const records: ReplayRecord[] = [];
    
    for (const obs of timeline) {
      records.push(await this.replayService.replay(obs.id, policy));
    }
    
    // Reverse chronologically for the UI
    return records.sort((a, b) => (b.occurredAt < a.occurredAt ? -1 : b.occurredAt > a.occurredAt ? 1 : 0));
  }

  /**
   * Replays a single observation deterministically.
   */
  async replayObservation(observationId: string, policy: VerificationPolicy = "shallow"): Promise<ReplayRecord> {
    return await this.replayService.replay(observationId, policy);
  }
}
