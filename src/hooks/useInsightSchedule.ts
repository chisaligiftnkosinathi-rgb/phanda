import { useEffect, useState, useCallback } from "react";
import { InsightSchedulerService } from "../services/insightSchedulerService";
import { UISchedulerConfig, UICognitiveSweep } from "../types/insightScheduler.types";

export const useInsightSchedule = () => {
  const [config, setConfig] = useState<UISchedulerConfig | null>(null);
  const [history, setHistory] = useState<UICognitiveSweep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, hist] = await Promise.all([
        InsightSchedulerService.getConfig(),
        InsightSchedulerService.getSweepHistory()
      ]);
      setConfig(cfg);
      setHistory(hist);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateConfig = async (payload: Partial<UISchedulerConfig>) => {
    try {
      const newCfg = await InsightSchedulerService.setConfig(payload);
      setConfig(newCfg);
    } catch (e: any) {
      setError(e);
      throw e;
    }
  };

  // MOCK function to simulate the cron executing
  const simulateCronSweep = async () => {
    try {
      await InsightSchedulerService.triggerScheduledSweep();
      await fetchAll();
    } catch (e: any) {
      setError(e);
      throw e;
    }
  };

  return { config, history, loading, error, refresh: fetchAll, updateConfig, simulateCronSweep };
};
