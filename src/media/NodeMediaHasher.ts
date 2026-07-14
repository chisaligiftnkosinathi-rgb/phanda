import * as crypto from 'crypto';
import * as fs from 'fs';
import { MediaHasher } from './MediaHasher';

export class NodeMediaHasher implements MediaHasher {
  async hashFile(uri: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(uri);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }
}
