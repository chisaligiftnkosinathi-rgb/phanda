import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { MediaHasher } from "./MediaHasher";

export class ExpoMediaHasher implements MediaHasher {
  
  async hashFile(uri: string): Promise<string> {
    // Read file entirely into memory as Base64. 
    // WARNING: For large videos in production, we need a streaming hasher.
    // However, expo-crypto currently requires strings, and expo-file-system provides base64.
    // For Alpha, this works perfectly for photos and audio.
    const fileContentBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Hash the raw string
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContentBase64
    );

    return digest;
  }

  async verifyHash(uri: string, expectedHash: string): Promise<boolean> {
    try {
      const actualHash = await this.hashFile(uri);
      return actualHash === expectedHash;
    } catch (e) {
      return false; // If the file can't be read, it fails verification
    }
  }
}
