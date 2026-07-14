import { apiClient } from "./client";

export const workApi = {
  getAll: () => apiClient.get("work"),

  getById: (id: string) => apiClient.get(`work/${id}`),

  createFromInvoice: (invoiceId: string) =>
    apiClient.post(`invoices/${invoiceId}/work/create`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`work/${id}/status`, { status }),

  addExpense: (id: string, expense: any) =>
    apiClient.post(`work/${id}/expenses`, expense),

  complete: (id: string) => apiClient.post(`work/${id}/complete`),
};
