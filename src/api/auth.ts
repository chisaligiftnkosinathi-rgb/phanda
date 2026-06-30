import { apiClient } from "./client";

export const authApi = {
  // POST /api/v1/auth/register → returns { access_token, token_type }
  register: (email: string, password: string) =>
    apiClient.post("auth/register", { email, password }),

  // POST /api/v1/auth/login → returns { access_token, token_type }
  login: (email: string, password: string) =>
    apiClient.post("auth/login", { email, password }),
};
