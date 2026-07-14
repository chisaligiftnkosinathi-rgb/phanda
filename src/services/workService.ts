import { workApi } from "../api/workApi";
import { UIWork } from "../types/work.types";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';

export const WorkService = {
  async createFromInvoice(permissions: Permission[] | undefined, invoiceId: string): Promise<UIWork> {
    // Only certain users can spawn work from invoices (e.g. business/admin)
    TrustPermissionEngine.assertCanCreateInvoice(permissions); 
    try {
      const res = await workApi.createFromInvoice(invoiceId);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[WorkService] createFromInvoice failed:", e);
      throw new Error("Failed to create work from invoice");
    }
  },

  async getWork(id: string): Promise<UIWork> {
    try {
      const res = await workApi.getById(id);
      return mapToUI(res.data);
    } catch (e) {
      console.error(`[WorkService] getWork(${id}) failed:`, e);
      throw new Error("Failed to load work details");
    }
  },

  async updateStatus(id: string, status: string): Promise<UIWork> {
    try {
      const res = await workApi.updateStatus(id, status);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[WorkService] updateStatus failed:", e);
      throw new Error("Failed to update work status");
    }
  },

  async addExpense(id: string, expense: any): Promise<UIWork> {
    try {
      const res = await workApi.addExpense(id, expense);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[WorkService] addExpense failed:", e);
      throw new Error("Failed to add expense to work");
    }
  },

  async completeWork(id: string): Promise<UIWork> {
    try {
      const res = await workApi.complete(id);
      return mapToUI(res.data);
    } catch (e) {
      console.error("[WorkService] completeWork failed:", e);
      throw new Error("Failed to complete work");
    }
  }
};

// --------------------
// MAPPER
// --------------------
function mapToUI(dto: any): UIWork {
  return {
    id: dto.id || "unknown",

    quoteId: dto.quote_id || "unknown",
    invoiceId: dto.invoice_id || "unknown",

    title: dto.title || "Untitled Work",
    description: dto.description ?? "",

    type: dto.type ?? "job_card",
    status: dto.status ?? "pending",

    assignedTo: dto.assigned_to,

    items: dto.items ?? [],
    expenses: dto.expenses ?? [],

    laborCost: dto.labor_cost || { amount: 0, currency: "ZAR" },
    totalCost: dto.total_cost || { amount: 0, currency: "ZAR" },

    ownerId: dto.owner_id || "unknown",
    ownerName: dto.owner_name,

    createdAt: dto.created_at || new Date().toISOString(),
    updatedAt: dto.updated_at,

    startedAt: dto.started_at,
    completedAt: dto.completed_at
  };
}
