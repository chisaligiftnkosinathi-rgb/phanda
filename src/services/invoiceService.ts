import { invoiceApi } from "../api/invoiceApi";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';
import { UIInvoice } from "../types/invoice.types";

export const InvoiceService = {
  async getInvoices(): Promise<UIInvoice[]> {
    try {
      const res = await invoiceApi.getAll();
      return res.data.map(mapToUI);
    } catch (e) {
      console.error("[InvoiceService] getInvoices failed:", e);
      throw new Error("Failed to load invoices");
    }
  },

  async getInvoice(id: string): Promise<UIInvoice> {
    try {
      const res = await invoiceApi.getById(id);
      return mapToUI(res.data);
    } catch (e) {
      console.error(`[InvoiceService] getInvoice(${id}) failed:`, e);
      throw new Error("Failed to load invoice details");
    }
  },

  async generateFromQuote(permissions: Permission[] | undefined, quoteId: string): Promise<UIInvoice> {
    TrustPermissionEngine.assertCanCreateInvoice(permissions);
    try {
      const res = await invoiceApi.generateFromQuote(quoteId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[InvoiceService] generateFromQuote failed:", e);
      throw new Error("Failed to generate invoice from quote");
    }
  },

  async markPaid(permissions: Permission[] | undefined, invoiceId: string): Promise<UIInvoice> {
    TrustPermissionEngine.assertCanProcessPayment(permissions);
    try {
      const res = await invoiceApi.markPaid(invoiceId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[InvoiceService] markPaid failed:", e);
      throw new Error("Failed to mark invoice as paid");
    }
  }
};

// --------------------
// MAPPER
// --------------------
function mapToUI(dto: any): UIInvoice {
  return {
    id: dto.id || "unknown",
    quoteId: dto.quote_id || "unknown",
    leadId: dto.lead_id || "unknown",

    status: dto.status ?? "issued",

    items: dto.items ?? [],

    subtotal: dto.subtotal || { amount: 0, currency: "ZAR" },
    tax: dto.tax,
    total: dto.total || { amount: 0, currency: "ZAR" },

    dueDate: dto.due_date || new Date().toISOString(),
    issuedAt: dto.issued_at || new Date().toISOString(),

    ownerId: dto.owner_id || "unknown",
    ownerName: dto.owner_name,

    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at
  };
}
