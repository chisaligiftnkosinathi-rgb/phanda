export interface Observation {
  schemaVersion: 1;
  id: string;
  occurredAt: string;
  capturedAt: string;
  type: "text" | "photo" | "audio" | "document" | "location";
  content: string;
  metadata?: Record<string, unknown>;
  previousHash: string | null;
  hash: string;
}
