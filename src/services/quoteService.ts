import { quoteApi } from "../api/quoteApi";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';
import { UIQuote } from "../types/quote.types";

export const QuoteService = {
  async getQuotes(): Promise<UIQuote[]> {
    try {
      const res = await quoteApi.getAll();
      return res.data.map(mapToUI);
    } catch (e) {
      console.error("[QuoteService] getQuotes failed:", e);
      throw new Error("Failed to load quotes");
    }
  },

  async getQuote(id: string): Promise<UIQuote> {
    try {
      const res = await quoteApi.getById(id);
      return mapToUI(res.data);
    } catch (e) {
      console.error(`[QuoteService] getQuote(${id}) failed:`, e);
      throw new Error("Failed to load quote details");
    }
  },

  async generateFromLead(permissions: Permission[] | undefined, leadId: string): Promise<UIQuote> {
    TrustPermissionEngine.assertCanGenerateQuote(permissions);
    try {
      const res = await quoteApi.generateFromLead(leadId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[QuoteService] generateFromLead failed:", e);
      throw new Error("Failed to generate quote from lead");
    }
  },

  async sendQuote(permissions: Permission[] | undefined, quoteId: string): Promise<UIQuote> {
    TrustPermissionEngine.assertCanSendQuote(permissions);
    try {
      const res = await quoteApi.send(quoteId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[QuoteService] sendQuote failed:", e);
      throw new Error("Failed to send quote");
    }
  },

  async acceptQuote(quoteId: string): Promise<UIQuote> {
    try {
      const res = await quoteApi.accept(quoteId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[QuoteService] acceptQuote failed:", e);
      throw new Error("Failed to accept quote");
    }
  },

  async rejectQuote(quoteId: string): Promise<UIQuote> {
    try {
      const res = await quoteApi.reject(quoteId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[QuoteService] rejectQuote failed:", e);
      throw new Error("Failed to reject quote");
    }
  }
};

// --------------------
// DETERMINISTIC MAPPER
// --------------------
function mapToUI(dto: any): UIQuote {
  return {
    id: dto.id || "unknown",
    leadId: dto.lead_id || "unknown",

    title: dto.title || "Generated Quote",
    description: dto.description ?? "",

    status: dto.status ?? "draft",

    items: dto.items ?? [],

    subtotal: dto.subtotal || { amount: 0, currency: "ZAR" },
    tax: dto.tax,
    total: dto.total || { amount: 0, currency: "ZAR" },

    trustSnapshot: {
      trustScore: dto.trust_score ?? 0,
      verificationLevel: dto.verification_level ?? 0,
      isVerified: dto.is_verified ?? false
    },

    ownerId: dto.owner_id || "unknown",
    ownerName: dto.owner_name,

    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at,
    expiresAt: dto.expires_at
  };
}
