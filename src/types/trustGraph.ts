export interface TrustEdge {
  id: string; // Unique edge id (e.g. fromId_toId)
  fromEntityId: string;
  toEntityId: string;
  weight: number;          // 0.0 to 1.0 (Strength of relationship)
  interactions: number;    // Count of shared events
  successRate: number;     // Ratio of successful interactions (0 to 1)
  lastInteraction: string; // ISO Timestamp
}
