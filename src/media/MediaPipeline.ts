import { MediaAttachment } from "./MediaAttachment";
import { MediaStore } from "./MediaStore";
import { MediaHasher } from "./MediaHasher";
import { MediaError } from "./MediaErrors";
import * as fs from 'fs'; // Just for size check in Node testing, in prod use expo-file-system

export class MediaPipeline {
  constructor(
    private store: MediaStore,
    private hasher: MediaHasher
  ) {}

  /**
   * Orchestrates the durable saving of a media file.
   * This MUST complete before LedgerService.capture is called.
   */
  async processTempFile(
    tempUri: string,
    observationId: string,
    mediaId: string,
    type: "photo" | "audio" | "document",
    mimeType: string,
    fileExtension: string
  ): Promise<MediaAttachment> {
    try {
      // 1. Calculate Checksum from temp file
      const checksum = await this.hasher.hashFile(tempUri);

      // 2. Calculate Size (using fs.promises.stat for Node mock)
      let size = 0;
      try {
        const stats = await fs.promises.stat(tempUri);
        size = stats.size;
      } catch (e) {
        // Fallback or ignore for now, in real app use FileSystem.getInfoAsync
      }

      // 3. Move to permanent store
      // We partition by type
      const destinationPath = `${type}s/${mediaId}${fileExtension}`;
      const storageUri = await this.store.put(tempUri, destinationPath);

      // 4. Return the Attachment Record (ready for Ledger)
      return {
        mediaId,
        observationId,
        type,
        storageUri,
        mimeType,
        size,
        checksum,
        createdAt: new Date().toISOString(),
        schemaVersion: 1
      };
    } catch (e: any) {
      throw new MediaError("STORAGE_ERROR", `Failed to process media: ${e.message}`);
    }
  }
}
