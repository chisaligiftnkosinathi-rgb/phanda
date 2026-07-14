import { leadApi } from "../api/leadApi";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';
import { UILead } from "../types/lead.types";

export const LeadService = {
  async getLeads(): Promise<UILead[]> {
    try {
      const res = await leadApi.getAll();
      return res.data.map(mapToUI);
    } catch (e) {
      console.error("[LeadService] getLeads failed:", e);
      throw new Error("Failed to load leads");
    }
  },

  async getLead(id: string): Promise<UILead> {
    try {
      const res = await leadApi.getById(id);
      return mapToUI(res.data);
    } catch (e) {
      console.error(`[LeadService] getLead(${id}) failed:`, e);
      throw new Error("Failed to load lead details");
    }
  },

  async createLead(permissions: Permission[] | undefined, payload: any): Promise<UILead> {
    TrustPermissionEngine.assertCanCreateLead(permissions);
    try {
      const res = await leadApi.create(payload);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[LeadService] createLead failed:", e);
      throw new Error("Failed to create lead");
    }
  },

  async convertToQuote(permissions: Permission[] | undefined, leadId: string, payload: any) {
    TrustPermissionEngine.assertCanConvertLead(permissions);
    // Note: In the future, this should ideally delegate to QuoteService.createQuoteFromLead(...)
    // For now, we hit the conversion endpoint and return the updated state.
    try {
      const res = await leadApi.convertToQuote(leadId, payload);
      return res.data; // Return the Quote or UILead representation based on backend
    } catch (e) {
      console.error("[LeadService] convertToQuote failed:", e);
      throw new Error("Failed to convert lead to quote");
    }
  },

  async convertToInvoice(permissions: Permission[] | undefined, leadId: string, payload: any) {
    TrustPermissionEngine.assertCanConvertLead(permissions);
    // Note: In the future, this should ideally delegate to InvoiceService.createInvoiceFromQuote(...)
    try {
      const res = await leadApi.convertToInvoice(leadId, payload);
      return res.data; 
    } catch (e) {
      console.error("[LeadService] convertToInvoice failed:", e);
      throw new Error("Failed to convert lead to invoice");
    }
  }
};

// --------------------
// MAPPER (DTO → UI)
// --------------------
function mapToUI(dto: any): UILead {
  return {
    id: dto.id || "unknown",
    title: dto.title || "Untitled Lead",
    description: dto.description ?? "",
    status: dto.status ?? "new",
    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at,

    ownerId: dto.owner_id || "unknown",
    ownerName: dto.owner_name,
    ownerAvatar: dto.owner_avatar,

    trust: {
      trustScore: dto.trust_score ?? 0,
      verificationLevel: dto.verification_level ?? 0,
      isVerified: dto.is_verified ?? false
    },

    media: dto.media ?? [],

    potentialValue: dto.potential_value ? {
      amount: dto.potential_value.amount,
      currency: dto.potential_value.currency || "ZAR"
    } : undefined,

    convertedToQuoteId: dto.converted_to_quote_id,
    convertedToInvoiceId: dto.converted_to_invoice_id,
    
    isQualified: dto.is_qualified ?? false
  };
}
