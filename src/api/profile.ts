import { apiClient } from "./client";

export const profileApi = {
  // GET /api/v1/profiles/me
  getMe: () =>
    apiClient.get("profiles/me"),

  // PATCH /api/v1/profiles/me
  update: (data: any) =>
    apiClient.patch("profiles/me", data),

  // GET /api/v1/profiles/me/onboarding-state
  getOnboardingState: () =>
    apiClient.get("profiles/me/onboarding-state"),

  // POST /api/v1/profiles/bootstrap
  bootstrap: () =>
    apiClient.post("profiles/bootstrap"),

  // GET /api/v1/profiles/{id}
  getById: (profileId: string) =>
    apiClient.get(`profiles/${profileId}`),

  // GET /api/v1/profiles/by-owner/{owner_id}
  getByOwner: (ownerId: string) =>
    apiClient.get(`profiles/by-owner/${ownerId}`),

  // PATCH /api/v1/profiles/{id}/location
  updateLocation: (profileId: string, data: any) =>
    apiClient.patch(`profiles/${profileId}/location`, data),
};
