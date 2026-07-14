import { campaignApi } from "../api/campaignApi";
import { UICampaign } from "../types/campaign.types";

export class CampaignService {
  static async createCampaign(payload: Partial<UICampaign>): Promise<UICampaign> {
    const res = await campaignApi.createCampaign(payload);
    return this.mapToUI(res.data);
  }

  static async getCampaigns(): Promise<UICampaign[]> {
    const res = await campaignApi.getCampaigns();
    return res.data.map(this.mapToUI);
  }

  static async getCampaignById(id: string): Promise<UICampaign> {
    const res = await campaignApi.getCampaignById(id);
    return this.mapToUI(res.data);
  }

  static async getByOwner(ownerId: string): Promise<UICampaign[]> {
    const res = await campaignApi.getByOwner(ownerId);
    return res.data.map(this.mapToUI);
  }

  private static mapToUI(dto: any): UICampaign {
    return {
      id: dto.id || "unknown",
      ownerId: dto.ownerId || dto.owner_id || "unknown",
      title: dto.title || "Untitled",
      message: dto.message || "",
      type: dto.type || "announcement",
      workIds: dto.workIds || dto.work_ids || [],
      reflectionIds: dto.reflectionIds || dto.reflection_ids || [],
      givingIds: dto.givingIds || dto.giving_ids || [],
      createdAt: dto.createdAt || dto.created_at || new Date().toISOString(),
      impressions: dto.impressions ?? 0,
      reactions: dto.reactions ?? 0,
    };
  }
}
