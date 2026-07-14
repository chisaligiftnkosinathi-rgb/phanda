export interface CaptureRequest {
  /**
   * Pre-generated UUID. Must be generated BEFORE capture begins
   * so that attachments or side-effects can reference it reliably.
   */
  id: string;
  type: "text" | "photo" | "audio" | "document" | "location";
  content: string;
  metadata?: Record<string, unknown>;
  /**
   * Optional override for historical imports. Defaults to now.
   */
  occurredAt?: string;
}
