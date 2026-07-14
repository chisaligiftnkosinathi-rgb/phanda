export class MediaError extends Error {
  constructor(public code: "ORPHANED_FILE" | "CHECKSUM_MISMATCH" | "FILE_MISSING" | "STORAGE_ERROR", message: string) {
    super(message);
    this.name = "MediaError";
  }
}
