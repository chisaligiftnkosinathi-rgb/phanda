export interface SensorResult {
  /**
   * The type of observation captured by this sensor.
   */
  type: "photo" | "audio" | "document" | "location" | "text";

  /**
   * The physical location of the raw binary data, if applicable.
   */
  tempUri?: string;

  /**
   * Direct text/json content if the sensor doesn't produce binary media (e.g. GPS, Text).
   */
  content?: string;

  mimeType?: string;

  /**
   * The exact time reality was captured, from the sensor's perspective.
   */
  timestamp: string;

  /**
   * Any sensor-specific metadata (width, height, accuracy, EXIF, etc)
   */
  metadata?: Record<string, unknown>;
}
