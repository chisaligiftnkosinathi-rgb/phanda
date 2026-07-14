import { SyncQueue } from "./SyncQueue";
import { SyncTransport } from "./SyncTransport";
import { StorageAdapter } from "../storage/StorageAdapter";

export class SyncWorker {
  private isWorking = false;

  constructor(
    private queue: SyncQueue,
    private transport: SyncTransport,
    private storage: StorageAdapter // Needed to read actual observation data during sync
  ) {}

  async wakeAndProcess(): Promise<void> {
    if (this.isWorking) return;
    this.isWorking = true;

    try {
      const pending = await this.queue.getPending();
      
      for (const record of pending) {
        await this.queue.updateRecord(record.observationId, { status: "SYNCING" });

        // Fetch immutable data from Ledger
        const timelineResult = await this.storage.loadTimeline();
        if (!timelineResult.success) {
          await this.markFailure(record, "Failed to load timeline");
          continue;
        }

        const observation = timelineResult.data.find(o => o.id === record.observationId);
        if (!observation) {
          // It's gone from the ledger? Unlikely, but mark as needs attention
          await this.markFailure(record, "Observation missing from ledger");
          continue;
        }

        const success = await this.transport.upload(observation);

        if (success) {
          await this.queue.updateRecord(record.observationId, {
            status: "SYNCED",
            lastAttempt: new Date().toISOString()
          });
        } else {
          await this.markFailure(record, "Transport rejected upload");
        }
      }
    } finally {
      this.isWorking = false;
    }
  }

  private async markFailure(record: any, errorMsg: string) {
    const nextRetryMs = new Date().getTime() + (Math.pow(2, record.retryCount) * 1000); // Exp backoff
    await this.queue.updateRecord(record.observationId, {
      status: "NEEDS_ATTENTION",
      retryCount: record.retryCount + 1,
      lastError: errorMsg,
      lastAttempt: new Date().toISOString(),
      nextRetry: new Date(nextRetryMs).toISOString()
    });
  }
}
