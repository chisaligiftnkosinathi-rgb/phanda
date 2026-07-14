import { UIGiving } from "../types/giving.types";
import { apiClient } from "./client"; // Make sure to use the correct client relative path

export const givingApi = {
  createGive: (payload: Partial<UIGiving>) =>
    apiClient.post("giving", payload),

  getGivenByUser: (userId: string) =>
    apiClient.get(`giving/given/${userId}`),

  getReceivedByUser: (userId: string) =>
    apiClient.get(`giving/received/${userId}`),

  getByContext: (contextId: string) =>
    apiClient.get(`giving/context/${contextId}`),
};
