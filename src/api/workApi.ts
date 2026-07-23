import { apiClient } from "./client";

export const workApi = {
  getAll: () => apiClient.get("opportunities"),

  getById: (id: string) => apiClient.get(`opportunities/${id}`),

  createFromInvoice: (invoiceId: string) =>
    apiClient.post(`invoices/${invoiceId}/opportunities/create`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`opportunities/${id}/status`, { status }),

  addExpense: (id: string, expense: any) =>
    apiClient.post(`opportunities/${id}/expenses`, expense),

  complete: (id: string) => apiClient.post(`opportunities/${id}/complete`),
};
