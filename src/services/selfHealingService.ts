import { selfHealingApi } from "../api/selfHealingApi";
import { UIMemoryConflict, UISystemHealthStatus, UIHealingSuggestion, UIMemoryStateSnapshot } from "../types/selfHealing.types";

export class SelfHealingService {
  /**
   * Detects conflicts across A, B, C, and C+ without resolving them.
   */
  static async detectConflicts(): Promise<UIMemoryConflict[]> {
    try {
      const res = await selfHealingApi.getConflicts();
      return res.data.map(this.mapConflictToUI);
    } catch {
      return [];
    }
  }

  /**
   * Tracks how meaning changes over time.
   */
  static async analyzeDrift(): Promise<{ snapshots: UIMemoryStateSnapshot[], divergenceScore: number }> {
    try {
      const res = await selfHealingApi.getDriftReport();
      return {
        snapshots: res.data.snapshots || [],
        divergenceScore: typeof res.data.divergenceScore === 'number' ? res.data.divergenceScore : 0
      };
    } catch {
      return { snapshots: [], divergenceScore: 0 };
    }
  }

  /**
   * Generates parallel valid interpretations for a conflict. 
   * It does NOT choose a single truth.
   */
  static async generateHealingMap(conflictId: string): Promise<UIHealingSuggestion[]> {
    try {
      const res = await selfHealingApi.getHealingMap(conflictId);
      return res.data.map(this.mapSuggestionToUI);
    } catch {
      return [];
    }
  }

  /**
   * Classifies the overall structural tension.
   */
  static async classifySystemHealth(): Promise<UISystemHealthStatus> {
    try {
      const res = await selfHealingApi.getSystemHealth();
      return res.data.status || "healthy";
    } catch {
      return "healthy";
    }
  }

  private static mapConflictToUI(dto: any): UIMemoryConflict {
    return {
      id: dto.id || "unknown",
      conflictType: dto.conflictType || "semantic_mismatch",
      sourceA: dto.sourceA || "unknown_a",
      sourceB: dto.sourceB || "unknown_b",
      severityScore: typeof dto.severityScore === 'number' ? dto.severityScore : 0.5,
      firstObservedAt: dto.firstObservedAt || new Date().toISOString(),
      frequencyCount: typeof dto.frequencyCount === 'number' ? dto.frequencyCount : 1
    };
  }

  private static mapSuggestionToUI(dto: any): UIHealingSuggestion {
    return {
      id: dto.id || "sugg_unknown",
      conflictId: dto.conflictId || "unknown_conflict",
      strategyType: dto.strategyType || "annotate_only",
      explanation: dto.explanation || "No explanation provided.",
      confidence: typeof dto.confidence === 'number' ? dto.confidence : 0.5,
      impactScope: dto.impactScope || "cross-layer"
    };
  }
}
