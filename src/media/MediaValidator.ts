import { MediaAttachment } from "./MediaAttachment";
import { MediaStore } from "./MediaStore";
import { MediaHasher } from "./MediaHasher";
import { MediaError } from "./MediaErrors";

export class MediaValidator {
  constructor(
    private store: MediaStore,
    private hasher: MediaHasher
  ) {}

  /**
   * Verifies that the physical file exists and matches the immutable checksum.
   * Does NOT modify the Observation or the Ledger.
   */
  async validate(attachment: MediaAttachment): Promise<void> {
    const exists = await this.store.exists(attachment.storageUri);
    if (!exists) {
      throw new MediaError("FILE_MISSING", `File not found at ${attachment.storageUri}`);
    }

    const actualUri = await this.store.get(attachment.storageUri);
    const actualChecksum = await this.hasher.hashFile(actualUri);

    if (actualChecksum !== attachment.checksum) {
      throw new MediaError("CHECKSUM_MISMATCH", `Checksum mismatch for ${attachment.mediaId}`);
    }
  }
}
