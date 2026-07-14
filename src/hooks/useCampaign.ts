import { useEffect, useState } from "react";
import { CampaignService } from "../services/campaignService";
import { UICampaign } from "../types/campaign.types";

export const useCampaign = (id: string) => {
  const [data, setData] = useState<UICampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await CampaignService.getCampaignById(id);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  return { data, loading };
};
