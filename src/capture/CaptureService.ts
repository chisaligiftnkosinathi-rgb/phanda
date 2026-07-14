import { CaptureRequest } from "./CaptureRequest";
import { CaptureResult } from "./CaptureResult";
import { LedgerService } from "../ledger/LedgerService";
import { SyncQueue } from "../sync/SyncQueue";

export class CaptureService {
  constructor(
    private ledgerService: LedgerService,
    private syncQueue: SyncQueue
  ) {}

  /**
   * Validates reality payload, locks it into the Immutable Ledger,
   * and delegates upload to the SyncQueue. Returns instantly after local persistence.
   */
  async capture(request: CaptureRequest): Promise<CaptureResult> {
    try {
      if (!request.id || !request.content || !request.type) {
        throw new Error("Invalid CaptureRequest: Missing required fields.");
      }

      const capturedAt = new Date().toISOString();
      const occurredAt = request.occurredAt || capturedAt;

      // 1. Write to Ledger (Atomic)
      const success = await this.ledgerService.capture({
        id: request.id,
        occurredAt,
        capturedAt,
        type: request.type,
        content: request.content,
        metadata: request.metadata
      });

      if (!success) {
        throw new Error("Ledger rejected the observation.");
      }

      // 2. Queue for future sync (Decoupled from persistence)
      await this.syncQueue.enqueue(request.id);

      // 3. Return immediately to the user
      return { success: true, observationId: request.id };

    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error(String(e))
      };
    }
  }
}
