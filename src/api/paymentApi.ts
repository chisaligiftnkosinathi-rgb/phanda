import { apiClient } from "./client";
// ShadowExecutor removed — shadow comparison is a server-side concern (FastAPI middleware).
// The mobile app only receives the final response from the API.

export const paymentApi = {
  getByInvoice: (invoiceId: string) =>
    apiClient.get(`invoices/${invoiceId}/payments`),

  processPayment: (invoiceId: string, payload: any) =>
    apiClient.post(`invoices/${invoiceId}/pay`, payload),
};

