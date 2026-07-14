import { useState } from "react";
import { CampaignService } from "../services/campaignService";
import { UICampaign } from "../types/campaign.types";

export const useCampaignAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (payload: Partial<UICampaign>) => {
    setLoading(true);
    setError(null);
    try {
      return await CampaignService.createCampaign(payload);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
