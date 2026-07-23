export interface MediaStore {
  /**
   * Persists a temporary file to long-term storage.
   * @param tempUri The URI of the raw file
   * @param destinationPath The relative path within the media store (e.g. photos/xyz.jpg)
   * @returns The final storage URI
   */
  put(tempUri: string, destinationPath: string): Promise<string>;

  /**
   * Retrieves the physical URI for a given storage path.
   */
  get(path: string): Promise<string>;

  /**
   * Checks if a file physically exists.
   */
  exists(path: string): Promise<boolean>;

  /**
   * Irreversibly deletes a file.
   */
  delete(path: string): Promise<void>;

  /**
   * Lists all media paths in the store, used for Garbage Collection.
   */
  listAll(): Promise<string[]>;

  /**
   * Returns the byte size of the file at the given URI.
   * Implementations use platform-appropriate APIs (FileSystem on Expo, fs.stat on Node).
   */
  getFileSize(uri: string): Promise<number>;
}
