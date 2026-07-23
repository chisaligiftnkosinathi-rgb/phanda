import { promises as fs } from 'fs';
import * as path from 'path';
import { MediaStore } from './MediaStore';

export class NodeMediaStore implements MediaStore {
  private baseDir: string;

  constructor(baseDir: string = path.join(__dirname, '../../.media_store_mock')) {
    this.baseDir = baseDir;
  }

  private async ensureDir(filePath: string) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  async put(tempUri: string, destinationPath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, destinationPath);
    await this.ensureDir(fullPath);
    await fs.copyFile(tempUri, fullPath);
    return fullPath;
  }

  async get(destinationPath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, destinationPath);
    return fullPath; // In Node we just return the absolute path
  }

  async exists(destinationPath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseDir, destinationPath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(destinationPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.baseDir, destinationPath);
      await fs.unlink(fullPath);
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }
  }

  async listAll(): Promise<string[]> {
    const results: string[] = [];
    
    async function walk(dir: string, base: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const res = path.resolve(dir, entry.name);
          const rel = path.relative(base, res);
          if (entry.isDirectory()) {
            await walk(res, base);
          } else {
            // Standardize paths to forward slashes for internal use
            results.push(rel.replace(/\\/g, '/'));
          }
        }
      } catch (e: any) {
        if (e.code !== 'ENOENT') throw e;
      }
    }

    await walk(this.baseDir, this.baseDir);
    return results;
  }

  async getFileSize(uri: string): Promise<number> {
    const stats = await fs.stat(uri);
    return stats.size;
  }
}
