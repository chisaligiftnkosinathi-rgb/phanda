import { apiClient } from "./client";

export const invoiceApi = {
  getAll: () => apiClient.get("invoices"),

  getById: (id: string) => apiClient.get(`invoices/${id}`),

  generateFromQuote: (quoteId: string) =>
    apiClient.post(`quotes/${quoteId}/invoice/generate`),

  markPaid: (id: string) => apiClient.post(`invoices/${id}/mark-paid`),
};
