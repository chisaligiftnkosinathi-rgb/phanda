import { apiClient } from "./client";
import { UISchedulerConfig } from "../types/insightScheduler.types";

export const insightSchedulerApi = {
  getSchedule: () =>
    apiClient.get("insights/scheduler/config"),

  setSchedule: (payload: Partial<UISchedulerConfig>) =>
    apiClient.put("insights/scheduler/config", payload),

  getSweepHistory: () =>
    apiClient.get("insights/scheduler/history"),
};
