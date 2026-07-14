import { apiClient } from "./client";
import { UIScripture } from "../types/scripture.types";

export const scriptureApi = {
  createScripture: (payload: Partial<UIScripture>) =>
    apiClient.post("scripture", payload),

  getScriptures: () =>
    apiClient.get("scripture"),

  getScriptureById: (id: string) =>
    apiClient.get(`scripture/${id}`),

  getByType: (type: string) =>
    apiClient.get(`scripture/type/${type}`),

  lockScripture: (id: string) =>
    apiClient.post(`scripture/${id}/lock`),
};
