export interface MediaAttachment {
  /**
   * The permanent logical identity (e.g. UUID).
   * Stable across renames, relocations, and backups.
   */
  mediaId: string;

  /**
   * Foreign key strictly linking this media back to its
   * immutable origin observation.
   */
  observationId: string;

  type: "photo" | "audio" | "document";

  /**
   * The current physical location.
   * Can change without altering the mediaId.
   */
  storageUri: string;

  mimeType: string;

  size: number;

  /**
   * Cryptographic integrity check to verify the file.
   */
  checksum: string;

  createdAt: string;

  schemaVersion: 1;
}
