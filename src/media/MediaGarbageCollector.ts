import { MediaStore } from "./MediaStore";
import { StorageAdapter } from "../storage/StorageAdapter";
import { MediaAttachment } from "./MediaAttachment";

export class MediaGarbageCollector {
  constructor(
    private mediaStore: MediaStore,
    private storageAdapter: StorageAdapter
  ) {}

  /**
   * Scans the MediaStore for any files that do NOT have a corresponding
   * MediaAttachment referenced in the Ledger.
   */
  async findOrphans(): Promise<string[]> {
    const allFiles = await this.mediaStore.listAll();
    
    const timelineResult = await this.storageAdapter.loadTimeline();
    if (!timelineResult.success) {
      throw new Error("Cannot run GC while ledger is unavailable");
    }

    // Extract all valid storage URIs from the ledger
    const validUris = new Set<string>();
    
    for (const obs of timelineResult.data) {
      if (obs.metadata && Array.isArray(obs.metadata.attachments)) {
        for (const att of obs.metadata.attachments as MediaAttachment[]) {
          // Normalize URI for comparison
          validUris.add(att.storageUri.replace(/\\/g, '/'));
        }
      }
    }

    const orphans = allFiles.filter(file => {
      const normalized = file.replace(/\\/g, '/');
      return !validUris.has(normalized);
    });

    return orphans;
  }

  async cleanOrphans(): Promise<void> {
    const orphans = await this.findOrphans();
    for (const orphan of orphans) {
      await this.mediaStore.delete(orphan);
    }
  }
}
