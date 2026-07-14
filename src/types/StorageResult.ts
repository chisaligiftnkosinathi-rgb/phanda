export type StorageResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: Error; code: string };

export const StorageErrorCodes = {
  CORRUPTION_DETECTED: "CORRUPTION_DETECTED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  IMMUTABILITY_VIOLATION: "IMMUTABILITY_VIOLATION",
  NOT_FOUND: "NOT_FOUND",
  UNKNOWN: "UNKNOWN"
} as const;
