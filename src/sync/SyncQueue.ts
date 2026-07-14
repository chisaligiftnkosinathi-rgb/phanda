import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncRecord } from "./SyncRecord";

const SYNC_QUEUE_KEY = '@phanda_sync_queue_v1';

export class SyncQueue {
  
  async getQueue(): Promise<SyncRecord[]> {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SyncRecord[];
    } catch {
      return [];
    }
  }

  async saveQueue(queue: SyncRecord[]): Promise<void> {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  async enqueue(observationId: string): Promise<void> {
    const queue = await this.getQueue();
    // Idempotent queue insertion
    if (!queue.find(q => q.observationId === observationId)) {
      queue.push({
        observationId,
        status: "QUEUED",
        retryCount: 0
      });
      await this.saveQueue(queue);
    }
  }

  async updateRecord(observationId: string, updates: Partial<SyncRecord>): Promise<void> {
    const queue = await this.getQueue();
    const idx = queue.findIndex(q => q.observationId === observationId);
    if (idx !== -1) {
      queue[idx] = { ...queue[idx], ...updates };
      await this.saveQueue(queue);
    }
  }

  async getPending(): Promise<SyncRecord[]> {
    const queue = await this.getQueue();
    const now = new Date().getTime();
    
    return queue.filter(q => 
      (q.status === "QUEUED" || q.status === "NEEDS_ATTENTION") &&
      (!q.nextRetry || new Date(q.nextRetry).getTime() <= now)
    );
  }
}
