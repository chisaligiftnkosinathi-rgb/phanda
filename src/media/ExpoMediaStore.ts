import * as FileSystem from 'expo-file-system';
import { MediaStore } from "./MediaStore";

export class ExpoMediaStore implements MediaStore {
  private readonly storageDir: string;

  constructor(storageDir?: string) {
    // Access documentDirectory safely for modern expo-file-system
    const docDir = (FileSystem as any).documentDirectory || '';
    this.storageDir = storageDir || `${docDir}phanda_media/`;
  }

  private async ensureDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.storageDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.storageDir, { intermediates: true });
    }
  }

  async put(tempUri: string, destinationPath: string): Promise<string> {
    await this.ensureDirectory();
    const destinationUri = `${this.storageDir}${destinationPath}`;
    
    await FileSystem.moveAsync({
      from: tempUri,
      to: destinationUri,
    });

    return destinationUri;
  }

  async get(path: string): Promise<string> {
    const uri = path.startsWith('file://') ? path : `${this.storageDir}${path}`;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new Error(`File not found: ${path}`);
    }
    return uri;
  }

  async exists(key: string): Promise<boolean> {
    const uri = key.startsWith('file://') ? key : `${this.storageDir}${key}`;
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  }

  async delete(key: string): Promise<void> {
    const uri = key.startsWith('file://') ? key : `${this.storageDir}${key}`;
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  }

  async listAll(): Promise<string[]> {
    await this.ensureDirectory();
    return await FileSystem.readDirectoryAsync(this.storageDir);
  }

  async storeFile(sourceUri: string, mediaId: string, fileExtension: string): Promise<string> {
    return this.put(sourceUri, `${mediaId}${fileExtension}`);
  }

  async verifyFileExists(uri: string): Promise<boolean> {
    return this.exists(uri);
  }

  async deleteFile(uri: string): Promise<void> {
    return this.delete(uri);
  }

  async getFileSize(uri: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && !info.isDirectory) {
      return info.size || 0;
    }
    throw new Error(`File not found: ${uri}`);
  }
}