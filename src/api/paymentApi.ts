import { apiClient } from "./client";
import { ShadowExecutor } from "../adapters/shadow/ShadowExecutor";

export const paymentApi = {
  getByInvoice: (invoiceId: string) =>
    apiClient.get(`invoices/${invoiceId}/payments`),

  processPayment: (invoiceId: string, payload: any) => {
    return ShadowExecutor.execute({
      capability: "Wallet Settlement",
      request: { invoiceId, payload },
      legacyHandler: () => apiClient.post(`invoices/${invoiceId}/pay`, payload),
      evidenceFactory: (legacyResult) => ({
        id: `evi_wallet_${Date.now()}`,
        sourceId: "phanda_wallet_payment",
        timestamp: new Date().toISOString(),
        payload: { invoiceId, transactionDetails: payload, legacySettlement: legacyResult },
        signatures: ["shadow-mode", "wallet-settlement"]
      })
    });
  },
};
