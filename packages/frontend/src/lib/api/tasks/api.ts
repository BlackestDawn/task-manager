import { apiClient } from "@/lib/api";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@task-manager/common";

export const tasksApi = {
  getUserTasks: (): Promise<Task[]> =>
    apiClient.get("/tasks"),

  getTaskById: (id: string): Promise<Task> =>
    apiClient.get(`/tasks/${id}`),

  createTask: (data: CreateTaskRequest): Promise<Task> =>
    apiClient.post("/tasks", data),

  updateTask: (id: string, data: Partial<UpdateTaskRequest>): Promise<Task> =>
    apiClient.put(`/tasks/${id}`, data),

  deleteTask: (id: string): Promise<void> =>
    apiClient.delete(`/tasks/${id}`),

  markTaskDone: (id: string): Promise<Task> =>
    apiClient.put(`/tasks/${id}/done`),
};
