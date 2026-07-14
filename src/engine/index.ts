/**
 * General Observation Engine API v1.0
 * 
 * This file serves as the official, frozen boundary between the immutable 
 * engine mechanics and any application UI (like Phanda) built on top of it.
 * 
 * Applications must NOT import directly from /ledger, /media, or /sync.
 * All interactions must flow through this public interface.
 */

// 1. The Core Facade
export { PhandaEngine as ObservationEngine } from "./PhandaEngine";

// 2. The Event System
export { EngineEventMap } from "./EngineEvents";

// 3. The Pure Interfaces
export { SensorResult } from "../sensors/SensorResult";
export { 
    ReplayRecord, 
    ReplayEvidence, 
    ConfidenceReport, 
    VerificationPolicy 
} from "../replay/ReplayRecord";
