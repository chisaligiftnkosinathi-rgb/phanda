import { reflectionApi } from "../api/reflectionApi";
import { UIReflection } from "../types/reflection.types";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';

export const ReflectionService = {
  /**
   * Purely observes and captures an experience.
   * STRICT BOUNDARY: This service MUST NOT trigger state changes on Work, Invoices, or Payments.
   */
  async submitReflection(permissions: Permission[] | undefined, workId: string, payload: any): Promise<UIReflection> {
    try {
      // Typically anyone involved in the work can reflect, we can add auth rules later if needed
      const res = await reflectionApi.create(workId, payload);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[ReflectionService] submitReflection failed:", e);
      throw new Error("Failed to submit reflection");
    }
  },

  async getReflections(workId: string): Promise<UIReflection[]> {
    try {
      const res = await reflectionApi.getByWork(workId);
      return res.data.map(mapToUI);
    } catch (e) {
      console.error(`[ReflectionService] getReflections(${workId}) failed:`, e);
      throw new Error("Failed to load reflections");
    }
  }
};

// --------------------
// MAPPER
// --------------------
function mapToUI(dto: any): UIReflection {
  return {
    id: dto.id || "unknown",
    workId: dto.work_id || "unknown",
    
    content: dto.content ?? "",
    sentiment: dto.sentiment,

    ownerId: dto.owner_id || "unknown",
    ownerName: dto.owner_name,

    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at
  };
}
