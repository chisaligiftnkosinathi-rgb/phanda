import { apiClient } from "./client";

export const leadApi = {
  getAll: () => apiClient.get("leads"),

  getById: (id: string) => apiClient.get(`leads/${id}`),

  create: (payload: any) => apiClient.post("leads", payload),

  update: (id: string, payload: any) => apiClient.put(`leads/${id}`, payload),

  delete: (id: string) => apiClient.delete(`leads/${id}`),

  // Conversion APIs
  convertToQuote: (id: string, payload: any) =>
    apiClient.post(`leads/${id}/convert/quote`, payload),

  convertToInvoice: (id: string, payload: any) =>
    apiClient.post(`leads/${id}/convert/invoice`, payload),
};
