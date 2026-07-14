import { apiClient } from "./client";
import { UICampaign } from "../types/campaign.types";

export const campaignApi = {
  createCampaign: (payload: Partial<UICampaign>) =>
    apiClient.post("campaigns", payload),

  getCampaigns: () =>
    apiClient.get("campaigns"),

  getCampaignById: (id: string) =>
    apiClient.get(`campaigns/${id}`),

  getByOwner: (ownerId: string) =>
    apiClient.get(`campaigns/owner/${ownerId}`),
};
