import { apiClient } from "./client";

export const reflectionApi = {
  create: (workId: string, payload: any) =>
    apiClient.post(`work/${workId}/reflections`, payload),

  getByWork: (workId: string) =>
    apiClient.get(`work/${workId}/reflections`),
};
