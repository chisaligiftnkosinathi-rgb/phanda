import { apiClient } from "./client";

export const mediaApi = {
  upload: async (formData: FormData) => {
    const res = await apiClient.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  getAll: async () => {
    const res = await apiClient.get("/media");
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get(`/media/${id}`);
    return res.data;
  }
};
