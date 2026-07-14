export interface SyncRecord {
  observationId: string;
  status: "QUEUED" | "SYNCING" | "SYNCED" | "NEEDS_ATTENTION";
  retryCount: number;
  lastAttempt?: string;
  lastError?: string;
  nextRetry?: string;
}
