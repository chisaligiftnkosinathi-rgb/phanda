import { givingApi } from "../api/givingApi";
import { UIGiving } from "../types/giving.types";

export class GivingService {
  static async createGive(payload: Partial<UIGiving>): Promise<UIGiving> {
    const res = await givingApi.createGive(payload);
    return this.mapToUI(res.data);
  }

  static async getGivenByUser(userId: string): Promise<UIGiving[]> {
    const res = await givingApi.getGivenByUser(userId);
    return res.data.map(this.mapToUI);
  }

  static async getReceivedByUser(userId: string): Promise<UIGiving[]> {
    const res = await givingApi.getReceivedByUser(userId);
    return res.data.map(this.mapToUI);
  }

  static async getByContext(contextId: string): Promise<UIGiving[]> {
    const res = await givingApi.getByContext(contextId);
    return res.data.map(this.mapToUI);
  }

  private static mapToUI(dto: any): UIGiving {
    return {
      id: dto.id || "unknown",
      giverId: dto.giver_id || dto.giverId || "unknown",
      receiverId: dto.receiver_id || dto.receiverId,
      workId: dto.work_id || dto.workId,
      reflectionId: dto.reflection_id || dto.reflectionId,
      type: dto.type ?? "appreciation",
      message: dto.message,
      value: dto.value
        ? { ...dto.value, symbolic: true }
        : undefined,
      createdAt: dto.created_at || dto.createdAt || new Date().toISOString(),
    };
  }
}
