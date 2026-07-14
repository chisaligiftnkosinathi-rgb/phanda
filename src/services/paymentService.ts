import { paymentApi } from "../api/paymentApi";
import { Permission } from '@/features/auth/types';
import { TrustPermissionEngine } from './guards/permissionEngine';
import { UIPayment } from "../types/payment.types";

export const PaymentService = {
  async processPayment(permissions: Permission[] | undefined, invoiceId: string, payload: any): Promise<UIPayment> {
    TrustPermissionEngine.assertCanProcessPayment(permissions);
    try {
      const res = await paymentApi.processPayment(invoiceId, payload) as any;
      return mapToUI(res?.data ?? res);
    } catch (e) {
      console.error("[PaymentService] processPayment failed:", e);
      throw new Error("Failed to process payment");
    }
  },

  async getPayments(invoiceId: string): Promise<UIPayment[]> {
    try {
      const res = await paymentApi.getByInvoice(invoiceId);
      return res.data.map(mapToUI);
    } catch (e) {
      console.error(`[PaymentService] getPayments(${invoiceId}) failed:`, e);
      throw new Error("Failed to load payments");
    }
  }
};

// --------------------
// MAPPER
// --------------------
function mapToUI(dto: any): UIPayment {
  return {
    id: dto.id || "unknown",
    invoiceId: dto.invoice_id || "unknown",

    amount: dto.amount || { amount: 0, currency: "ZAR" },
    status: dto.status ?? "pending",

    method: dto.method ?? "card",

    createdAt: dto.created_at || new Date().toISOString()
  };
}
