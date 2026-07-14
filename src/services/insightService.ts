import { insightApi } from "../api/insightApi";
import { UIInsight } from "../types/insight.types";

export class InsightService {
  /**
   * Insight Generation Pipeline (Triggered manually or via schedule)
   * Ingests A + B data snapshots, computes intelligence, and outputs patterns.
   * DOES NOT modify origin systems.
   */
  static async generateInsights(): Promise<UIInsight[]> {
    const res = await insightApi.generateInsights();
    return res.data.map(this.mapToUI);
  }

  static async getInsights(): Promise<UIInsight[]> {
    const res = await insightApi.getInsights();
    return res.data.map(this.mapToUI);
  }

  static async getInsightById(id: string): Promise<UIInsight> {
    const res = await insightApi.getInsightById(id);
    return this.mapToUI(res.data);
  }

  static async getInsightsByType(type: string): Promise<UIInsight[]> {
    const res = await insightApi.getInsightsByType(type);
    return res.data.map(this.mapToUI);
  }

  /**
   * Pattern Derivation Stubs
   * These methods represent the cognitive pipelines that derive intelligence.
   * They operate strictly as read-only cross-domain observers.
   */
  
  static analyzeConversionPatterns(leads: any[]): void {
    // Computes: "Leads with high trust convert 2.4x faster"
    // Outputs UIInsightType = "conversion_pattern"
  }

  static analyzeWorkEfficiency(workItems: any[]): void {
    // Computes: "Work items with early reflection complete 30% faster"
    // Outputs UIInsightType = "execution_efficiency"
  }

  static analyzeEmotionalFlow(reflections: any[]): void {
    // Computes patterns across textual or tagged sentiment
    // Outputs UIInsightType = "emotional_trend"
  }

  static analyzeGivingImpact(givingEvents: any[]): void {
    // Correlates giving events with work completion metrics
    // Outputs UIInsightType = "emotional_trend" or "behavioral_pattern"
  }

  static analyzeScriptureInfluence(scriptures: any[]): void {
    // Computes: "Scriptures tagged 'discipline' correlate with higher completion rates"
    // Outputs UIInsightType = "scripture_influence"
  }

  /**
   * Cross-Domain Correlation Stubs
   */
  static correlateWorkToReflection(work: any, reflection: any): void {}
  static correlateQuoteToConversion(quote: any, invoice: any, payment: any): void {}
  static correlateCampaignToEngagement(campaign: any, reactions: any): void {}

  private static mapToUI(dto: any): UIInsight {
    return {
      id: dto.id || "unknown",
      type: dto.type || "system_anomaly",
      title: dto.title || "Untitled Insight",
      description: dto.description || "",
      sources: {
        workIds: dto.sources?.workIds || [],
        leadIds: dto.sources?.leadIds || [],
        reflectionIds: dto.sources?.reflectionIds || [],
        campaignIds: dto.sources?.campaignIds || [],
        givingIds: dto.sources?.givingIds || [],
        scriptureIds: dto.sources?.scriptureIds || []
      },
      signalStrength: typeof dto.signalStrength === 'number' ? dto.signalStrength : 0.5,
      confidence: typeof dto.confidence === 'number' ? dto.confidence : 0.5,
      trendDirection: dto.trendDirection || "stable",
      createdAt: dto.createdAt || new Date().toISOString()
    };
  }
}
