import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from "./StorageAdapter";
import { Observation } from "../types/Observation";
import { Ledger } from "../types/Ledger";
import { StorageResult, StorageErrorCodes } from "../types/StorageResult";

import { validateLedgerPipeline } from "../ledger/validate";
import { LedgerValidationResult } from "../ledger/errors";

const LEDGER_KEY = '@phanda_ledger_v1';

export class AsyncStorageAdapter implements StorageAdapter {
  
  private async getRawLedger(): Promise<Ledger> {
    const raw = await AsyncStorage.getItem(LEDGER_KEY);
    if (!raw) return { version: 1, observations: [] };
    
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || !Array.isArray(parsed.observations)) {
        throw new Error("Corrupted structure");
      }
      return parsed as Ledger;
    } catch (e) {
      // In a real scenario we wouldn't throw raw errors but we handle validation later
      return { version: 1, observations: [] }; 
    }
  }

  private async saveRawLedger(ledger: Ledger): Promise<void> {
    await AsyncStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  }

  async saveObservation(observation: Observation): Promise<StorageResult<void>> {
    try {
      const ledger = await this.getRawLedger();
      
      const existingIndex = ledger.observations.findIndex(o => o.id === observation.id);
      
      if (existingIndex !== -1) {
        const existing = ledger.observations[existingIndex];
        // Immutability Check: If content or core timestamps differ, reject.
        if (existing.content !== observation.content || existing.type !== observation.type || existing.hash !== observation.hash) {
          return {
            success: false,
            error: new Error("Immutability violation: Cannot mutate existing observation."),
            code: StorageErrorCodes.IMMUTABILITY_VIOLATION
          };
        }
        // Exact match -> Idempotency Success
        return { success: true, data: undefined };
      }

      ledger.observations.push(observation);
      
      // Ensure Strict Chronology before save
      ledger.observations.sort((a, b) => 
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
      );

      await this.saveRawLedger(ledger);
      return { success: true, data: undefined };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error(String(e)),
        code: StorageErrorCodes.UNKNOWN
      };
    }
  }

  async loadTimeline(): Promise<StorageResult<Observation[]>> {
    try {
      const ledger = await this.getRawLedger();
      // Ensure sorted on read just in case
      const sorted = ledger.observations.sort((a, b) => 
        new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
      );
      return { success: true, data: sorted };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error(String(e)),
        code: StorageErrorCodes.UNKNOWN
      };
    }
  }

  async validateLedger(): Promise<StorageResult<LedgerValidationResult>> {
    try {
      const raw = await AsyncStorage.getItem(LEDGER_KEY);
      if (!raw) return { success: true, data: { valid: true, errors: [], observationCount: 0 } };
      
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.observations)) {
        return {
          success: false,
          error: new Error("Corrupted structure"),
          code: StorageErrorCodes.CORRUPTION_DETECTED
        };
      }

      const result = validateLedgerPipeline(parsed.observations);
      return { success: true, data: result };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error(String(e)),
        code: StorageErrorCodes.CORRUPTION_DETECTED
      };
    }
  }

  async backup(): Promise<StorageResult<string>> {
    try {
      const raw = await AsyncStorage.getItem(LEDGER_KEY);
      return { success: true, data: raw || JSON.stringify({ version: 1, observations: [] }) };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error(String(e)),
        code: StorageErrorCodes.UNKNOWN
      };
    }
  }

  async restore(source: string): Promise<StorageResult<void>> {
    try {
      // Validate source format before allowing restore
      const parsed = JSON.parse(source);
      if (typeof parsed !== 'object' || !Array.isArray(parsed.observations)) {
        return {
          success: false,
          error: new Error("Invalid backup format"),
          code: StorageErrorCodes.CORRUPTION_DETECTED
        };
      }
      
      await AsyncStorage.setItem(LEDGER_KEY, source);
      return { success: true, data: undefined };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e : new Error(String(e)),
        code: StorageErrorCodes.UNKNOWN
      };
    }
  }
}
