import { scriptureApi } from "../api/scriptureApi";
import { UIScripture, UIScriptureOriginType } from "../types/scripture.types";

export class ScriptureService {
  /**
   * ELEVATION METHODS (Extraction Only)
   * These methods pull meaning from their respective origins and stabilize it into the Canon.
   * They DO NOT modify the origin systems.
   */
  static async elevateFromReflection(reflectionId: string, title: string, content: string, tags: string[] = []): Promise<UIScripture> {
    return this.createCanonicalRecord("reflection", reflectionId, "reflection_insight", title, content, tags);
  }

  static async elevateFromWork(workId: string, title: string, content: string, tags: string[] = []): Promise<UIScripture> {
    return this.createCanonicalRecord("work", workId, "execution_lesson", title, content, tags);
  }

  static async elevateFromCampaign(campaignId: string, title: string, content: string, tags: string[] = []): Promise<UIScripture> {
    return this.createCanonicalRecord("campaign", campaignId, "campaign_statement", title, content, tags);
  }

  static async elevateFromGiving(givingId: string, title: string, content: string, tags: string[] = []): Promise<UIScripture> {
    return this.createCanonicalRecord("giving", givingId, "giving_meaning", title, content, tags);
  }

  private static async createCanonicalRecord(
    originType: UIScriptureOriginType,
    originId: string,
    type: string,
    title: string,
    content: string,
    tags: string[]
  ): Promise<UIScripture> {
    const payload: Partial<UIScripture> = {
      title,
      content,
      originType,
      originId,
      tags,
      weight: 1, // Default weight
      locked: false,
    };
    const res = await scriptureApi.createScripture(payload);
    return this.mapToUI(res.data);
  }

  /**
   * Freezes interpretation into canonical form.
   */
  static async lockScripture(id: string): Promise<UIScripture> {
    const res = await scriptureApi.lockScripture(id);
    return this.mapToUI(res.data);
  }

  static async getScriptures(): Promise<UIScripture[]> {
    const res = await scriptureApi.getScriptures();
    return res.data.map(this.mapToUI);
  }

  static async getScriptureById(id: string): Promise<UIScripture> {
    const res = await scriptureApi.getScriptureById(id);
    return this.mapToUI(res.data);
  }

  static async getByType(type: string): Promise<UIScripture[]> {
    const res = await scriptureApi.getByType(type);
    return res.data.map(this.mapToUI);
  }

  private static mapToUI(dto: any): UIScripture {
    return {
      id: dto.id || "unknown",
      title: dto.title || "Untitled Canon",
      content: dto.content || "",
      originType: dto.originType || dto.origin_type || "system",
      originId: dto.originId || dto.origin_id,
      tags: dto.tags || [],
      weight: dto.weight ?? 0,
      locked: !!dto.locked,
      createdAt: dto.createdAt || dto.created_at || new Date().toISOString(),
    };
  }
}
