import { Sensor } from "./Sensor";
import { SensorResult } from "./SensorResult";

/**
 * Configuration options specific to the Camera
 */
export interface CameraConfig {
  flashMode?: "on" | "off" | "auto";
  cameraType?: "front" | "back";
}

/**
 * Abstract interface representing the underlying hardware API (e.g. expo-camera)
 * Kept abstract here to allow easy mocking during Node-based constitutional tests.
 */
export interface HardwareCameraDevice {
  takePictureAsync(options: any): Promise<{ uri: string; width: number; height: number; exif?: any }>;
}

export class CameraSensor implements Sensor<CameraConfig> {
  constructor(private device: HardwareCameraDevice) {}

  async capture(config?: CameraConfig): Promise<SensorResult> {
    try {
      // The Sensor delegates the actual hardware work to the native module
      const result = await this.device.takePictureAsync({
        quality: 1,
        exif: true,
        // map config...
      });

      if (!result || !result.uri) {
        throw new Error("Hardware failed to return a valid image URI");
      }

      // The Sensor ONLY packages the observation data. 
      // It does NOT calculate hashes or write to databases.
      return {
        type: "photo",
        tempUri: result.uri,
        mimeType: "image/jpeg",
        timestamp: new Date().toISOString(),
        metadata: {
          width: result.width,
          height: result.height,
          exif: result.exif
        }
      };
    } catch (e: any) {
      throw new Error(`CameraSensor capture failed: ${e.message}`);
    }
  }
}
