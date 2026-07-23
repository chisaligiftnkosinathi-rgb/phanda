import { MediaAttachment } from "./MediaAttachment";
import { MediaStore } from "./MediaStore";
import { MediaHasher } from "./MediaHasher";
import { MediaError } from "./MediaErrors";


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

      // 2. Calculate Size via the injected MediaStore (Expo: FileSystem.getInfoAsync, Node: fs.stat)
      let size = 0;
      try {
        size = await this.store.getFileSize(tempUri);
      } catch (e) {
        // Non-fatal: size is informational metadata. Continue without it.
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
