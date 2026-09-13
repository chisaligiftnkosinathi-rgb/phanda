export type UIInsightType =
  | "behavioral_pattern"
  | "conversion_pattern"
  | "execution_efficiency"
  | "emotional_trend"
  | "meaning_evolution"
  | "system_anomaly";

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
    campaignIds?: string[];
  };

  // computed intelligence
  signalStrength: number; // 0-1
  confidence: number;     // 0-1

  trendDirection: UITrendDirection;

  createdAt: string;
}
