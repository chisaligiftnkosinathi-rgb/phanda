import { insightSchedulerApi } from "../api/insightSchedulerApi";
import { InsightService } from "./insightService";
import { UICognitiveSweep, UISchedulerConfig } from "../types/insightScheduler.types";

export class InsightSchedulerService {
  /**
   * Retrieves the current rhythm config for World C's temporal observer.
   */
  static async getConfig(): Promise<UISchedulerConfig> {
    const res = await insightSchedulerApi.getSchedule();
    return this.mapConfigToUI(res.data);
  }

  /**
   * Updates the temporal rhythm (daily, weekly, continuous_bounded).
   * Does not influence system behavior, only sets the sampling clock.
   */
  static async setConfig(payload: Partial<UISchedulerConfig>): Promise<UISchedulerConfig> {
    const res = await insightSchedulerApi.setSchedule(payload);
    return this.mapConfigToUI(res.data);
  }

  /**
   * Retrieves the history of sweeps, establishing a chronometer of observation evolution.
   */
  static async getSweepHistory(): Promise<UICognitiveSweep[]> {
    const res = await insightSchedulerApi.getSweepHistory();
    return res.data.map(this.mapSweepToUI);
  }

  /**
   * MOCK: Internally this would be called by a cron job or external clock.
   * It initiates a temporal sampling of timelines by invoking the Insight Engine.
   * Note: It DOES NOT act on the generated insights. It just logs the sweep.
   */
  static async triggerScheduledSweep(): Promise<UICognitiveSweep> {
    // 1. Log sweep started
    // 2. Invoke the pure cognition engine
    const insights = await InsightService.generateInsights();
    
    // 3. Log sweep completed, returning a time-indexed artifact of observation
    return {
      id: "sweep_" + Date.now(),
      rhythm: "daily", // this would be read from config
      sweepTimestamp: new Date().toISOString(),
      insightsGenerated: insights.length,
      status: "completed"
    };
  }

  private static mapConfigToUI(dto: any): UISchedulerConfig {
    return {
      active: !!dto.active,
      rhythm: dto.rhythm || "daily",
      lastSweepId: dto.lastSweepId || dto.last_sweep_id,
      nextScheduledSweep: dto.nextScheduledSweep || dto.next_scheduled_sweep,
    };
  }

  private static mapSweepToUI(dto: any): UICognitiveSweep {
    return {
      id: dto.id || "unknown",
      rhythm: dto.rhythm || "daily",
      sweepTimestamp: dto.sweepTimestamp || dto.sweep_timestamp || new Date().toISOString(),
      insightsGenerated: dto.insightsGenerated || dto.insights_generated || 0,
      status: dto.status || "completed"
    };
  }
}
