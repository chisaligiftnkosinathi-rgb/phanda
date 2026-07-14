export type UISweepRhythm = 
  | "daily" 
  | "weekly" 
  | "continuous_bounded"; // explicitly rejecting real-time recursion

export interface UICognitiveSweep {
  id: string;
  rhythm: UISweepRhythm;
  sweepTimestamp: string;
  insightsGenerated: number; // number of new or updated intelligence nodes
  status: "completed" | "failed" | "running";
}

export interface UISchedulerConfig {
  active: boolean;
  rhythm: UISweepRhythm;
  lastSweepId?: string;
  nextScheduledSweep?: string;
}
