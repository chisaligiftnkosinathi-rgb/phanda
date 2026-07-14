import { SensorResult } from "./SensorResult";

/**
 * A generalized interface for capturing reality.
 * Sensors are thin adapters. They do not know about hash chains,
 * storage mediums, sync queues, or ledger mechanics.
 */
export interface Sensor<TConfig> {
  capture(config?: TConfig): Promise<SensorResult>;
}
