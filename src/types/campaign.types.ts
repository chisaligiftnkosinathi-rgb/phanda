export type UICampaignType =
  | "announcement"
  | "gratitude_story"
  | "reflection_share"
  | "service_highlight"
  | "inspiration";

export interface UICampaign {
  id: string;
  ownerId: string;

  title: string;
  message: string;
  type: UICampaignType;

  // Read-only contextual links (NO mutation rights)
  workIds?: string[];
  reflectionIds?: string[];
  givingIds?: string[];

  createdAt: string;

  // Engagement metrics (NOT financial signals)
  impressions?: number;
  reactions?: number;
}
