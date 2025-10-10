'use server';
import { revalidatePath } from "next/cache";
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskDoneStatusRequest } from "@task-manager/common";
import { validateCreateTaskRequest, validateUpdateTaskRequest, validateUpdateTaskDoneStatusRequest } from "@task-manager/common";
import { serverFetch } from "@/lib/utils/serverFetch";

export async function getTasksAction(): Promise<Task[]> {
  try {
    return await serverFetch<Task[]>("/tasks");
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function getTaskAction(id: string): Promise<Task | null> {
  try {
    return await serverFetch<Task>(`/tasks/${id}`);
  } catch (error) {
    console.error(`Failed to fetch task ${id}:`, error);
    return null;
  }
}

export async function createTaskAction(formData: FormData) {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || "",
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string).toISOString() : null,
      priority: formData.get("priority") as string || "medium",
    }
    const data: CreateTaskRequest = validateCreateTaskRequest(rawData);

    const response = await serverFetch<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard")
    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Task creation failed" };
  }
}

export async function updateTaskAction(id: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || "",
      finishBy: formData.get("finishBy") ? new Date(formData.get("finishBy") as string) : null,
    }
    const data: UpdateTaskRequest = validateUpdateTaskRequest(rawData);

    const response = await serverFetch<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath(`/tasks/${id}`);
    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Task update failed" };
  }
}

export async function updateTaskDoneStatusAction(id: string, done: boolean) {
  try {
    const rawData = { done };
    const data: UpdateTaskDoneStatusRequest = validateUpdateTaskDoneStatusRequest(rawData);

    const response = await serverFetch<Task>(`/tasks/${id}/done`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath(`/tasks/${id}`);
    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Updating task status failed" };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    await serverFetch<void>(`/tasks/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return true;
  } catch (error) {
    console.error(`Failed to delete task ${id}:`, error);
    return false;
  }
}
