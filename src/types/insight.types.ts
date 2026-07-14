export type UIInsightType =
  | "behavioral_pattern"
  | "conversion_pattern"
  | "execution_efficiency"
  | "emotional_trend"
  | "meaning_evolution"
  | "system_anomaly"
  | "scripture_influence";

export type UITrendDirection = "improving" | "declining" | "stable";

export interface UIInsight {
  id: string;
  type: UIInsightType;

  title: string;
  description: string;

  // Origin References (what this insight was derived from)
  sources: {
    workIds?: string[];
    leadIds?: string[];
    reflectionIds?: string[];
    campaignIds?: string[];
    givingIds?: string[];
    scriptureIds?: string[];
  };

  // computed intelligence
  signalStrength: number; // 0-1
  confidence: number;     // 0-1

  trendDirection: UITrendDirection;

  createdAt: string;
}
