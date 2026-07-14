import { useEffect, useState, useCallback } from "react";
import { CampaignService } from "../services/campaignService";
import { UICampaign } from "../types/campaign.types";

export const useCampaigns = () => {
  const [data, setData] = useState<UICampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CampaignService.getCampaigns();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refresh: fetch };
};
