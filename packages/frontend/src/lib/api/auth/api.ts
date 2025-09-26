import { apiClient } from "@/lib/api";
import type { LoginRequest, LoginResponse, User, UpdateUserRequest, RefreshAccessTokenResponse } from "@task-manager/common";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);

    if (response.tokens) {
      apiClient.setAuthTokens(response.tokens.accessToken, response.tokens.refreshToken);
    }

    return response
  },

  logout: async (): Promise<void> => {
    const refreshToken = apiClient.getRefreshToken();

    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.warn("Failed to logout:", error);
      }
    }

    apiClient.clearAuthTokens();
  },

  refresh: async (): Promise<RefreshAccessTokenResponse> => {
    const refreshToken = apiClient.getRefreshToken();

    if (!refreshToken) throw new Error("No refresh token available");

    const response = await apiClient.post<RefreshAccessTokenResponse>("/auth/refresh", { token: refreshToken });

    apiClient.setAuthTokens(response.accessToken, refreshToken);

    return response;
  },

  getProfile: (): Promise<User> =>
    apiClient.get("/auth/profile"),

  updateProfile: (data: UpdateUserRequest): Promise<User> =>
    apiClient.put("/auth/profile", data)
};
