import { apiClient } from "../api";
import type { LoginRequest, LoginResponse, User, UpdateUserRequest } from "@task-manager/common";

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiClient.post("/auth/login", credentials),

  logout: (refreshToken: string): Promise<void> =>
    apiClient.post("/auth/logout", { token: refreshToken }),

  refresh: (refreshToken: string): Promise<LoginResponse> =>
    apiClient.post("/auth/refresh", { token: refreshToken }),

  getProfile: (): Promise<User> =>
    apiClient.get("/auth/profile"),

  updateProfile: (data: UpdateUserRequest): Promise<User> =>
    apiClient.put("/auth/profile", data)
};
