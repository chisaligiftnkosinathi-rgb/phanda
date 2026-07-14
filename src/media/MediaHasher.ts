export interface MediaHasher {
  /**
   * Computes the SHA-256 checksum of a physical file at the given URI.
   * @param uri The local file URI
   */
  hashFile(uri: string): Promise<string>;
}
