'use server';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverApiRequest } from "@/lib/auth/serverAuth";
import type { ActionResult } from "@/lib/data/interfaces";
import { validateTask, validateCreateTaskRequest, validateUpdateTaskRequest } from "@task-manager/common";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@task-manager/common";

export async function createTaskAction(formData: FormData): Promise<ActionResult<Task>> {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      finishBy: formData.get("finishBy") as string || undefined,
      userId: formData.get("userId") as string,
    };

    const validated: CreateTaskRequest = validateCreateTaskRequest(rawData);

    const res = await serverApiRequest<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(validated),
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, data: validateTask(res) };
  } catch (error) {
    console.error("Failed to create task", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTaskAction(formData: FormData, taskId: string): Promise<ActionResult<Task>> {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      finishBy: formData.get("finishBy") as string || undefined,
    };

    const validated: UpdateTaskRequest = validateUpdateTaskRequest(rawData);

    const res = await serverApiRequest<Task>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(validated),
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard");

    return { success: true, data: validateTask(res) };
  } catch (error) {
    console.error("Failed to update task", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  try {
    await serverApiRequest(`/tasks/${taskId}`, {
      method: "DELETE",
    });

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    redirect("/tasks");
  } catch (error) {
    console.error("Failed to delete task", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

export async function toggleTaskCompletionAction(taskId: string): Promise<ActionResult<Task>> {
  try {
    const res = await serverApiRequest<Task>(`/tasks/${taskId}/done`, {
      method: "PUT",
    });

    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard");

    return { success: true, data: validateTask(res) };
  } catch (error) {
    console.error("Failed to toggle task completion", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle task completion",
    };
  }
}
