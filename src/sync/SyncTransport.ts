import { Observation } from "../types/Observation";

/**
 * Agnostic interface for uploading observations.
 * Does not dictate REST, GraphQL, or WebSockets.
 */
export interface SyncTransport {
  upload(observation: Observation): Promise<boolean>;
}
