'use server';
import { revalidatePath } from "next/cache";
import type { Task, CreateTaskRequest, UpdateTaskRequest, UpdateTaskDoneStatusRequest, Group } from "@task-manager/common";
import { validateCreateTaskRequest, validateUpdateTaskRequest, validateUpdateTaskDoneStatusRequest} from "@task-manager/common";
import { serverGet, serverPost, serverPut, serverDelete } from "@/lib/utils/serverFetch";

export async function getTasksAction(): Promise<Task[]> {
  try {
    return await serverGet<Task[]>("/tasks");
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

export async function getTaskAction(id: string): Promise<Task | null> {
  try {
    return await serverGet<Task>(`/tasks/${id}`);
  } catch (error) {
    console.error(`Failed to fetch task ${id}:`, error);
    return null;
  }
}

export async function getTaskGroupsAction(id: string): Promise<Group[]> {
  try {
    const result = await serverGet<Group[]>(`/tasks/${id}/groups`);
    return result;
  } catch (error) {
    console.error(`Failed to fetch groups for task ${id}:`, error);
    return [];
  }
}

export async function createTaskAction(data: CreateTaskRequest) {
  try {
    const response = await serverPost<Task>("/tasks", validateCreateTaskRequest(data));

    revalidatePath("/tasks");
    revalidatePath("/dashboard")
    return { success: true, task: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Task creation failed",
    };
  }
}

export async function updateTaskAction(id: string, data: UpdateTaskRequest) {
  try {
    const response = await serverPut<Task>(`/tasks/${id}`, validateUpdateTaskRequest(data));

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath(`/tasks/${id}`);
    return { success: true, task: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Task update failed",
    };
  }
}

export async function updateTaskDoneStatusAction(id: string, data: UpdateTaskDoneStatusRequest) {
  try {
    const response = await serverPut<Task>(`/tasks/${id}/done`, validateUpdateTaskDoneStatusRequest(data));

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    revalidatePath(`/tasks/${id}`);
    return { success: true, task: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Updating task status failed",
    };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    await serverDelete<void>(`/tasks/${id}`);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete task ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Task deletion failed",
    };
  }
}
