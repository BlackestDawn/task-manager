import { apiClient } from "@/lib/api";
import type { LoginRequest, LoginResponse, User, UpdateUserRequest } from "@task-manager/common";

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiClient.post("/auth/login", credentials),

  logout: (): Promise<void> =>
    apiClient.post("/auth/logout", {}),

  refresh: (): Promise<{ success: boolean }> =>
    apiClient.post("/auth/refresh", {}),

  getProfile: (): Promise<User> =>
    apiClient.get("/auth/profile"),

  updateProfile: (data: UpdateUserRequest): Promise<User> =>
    apiClient.put("/auth/profile", data)
};
