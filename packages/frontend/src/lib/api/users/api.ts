import { apiClient } from "@/lib/api";
import type { User, CreateUserRequest, UpdateUserRequest, Task, Group } from "@task-manager/common";

export const usersApi = {
  getUsers: (): Promise<User[]> =>
    apiClient.get("/users"),

  getUserById: (id: string): Promise<User> =>
    apiClient.get(`/users/${id}`),

  createUser: (data: CreateUserRequest): Promise<User> =>
    apiClient.post("/users", data),

  updateUser: (id: string, data: Partial<UpdateUserRequest>): Promise<User> =>
    apiClient.put(`/users/${id}`, data),

  deleteUser: (id: string): Promise<void> =>
    apiClient.delete(`/users/${id}`),

  updateUserPassword: (id: string, password: string): Promise<User> =>
    apiClient.put(`/users/${id}/password`, { password: password}),

  updateUserDiasabledStatus: (id: string, disable: boolean): Promise<User> =>
    apiClient.put(`/users/${id}/disabled`, { disabled: disable}),

  getUserGroups: (id: string): Promise<Group[]> =>
    apiClient.get(`/users/${id}/groups`),

  getUserTasks: (id: string): Promise<Task[]> =>
    apiClient.get(`/users/${id}/tasks`),
}
