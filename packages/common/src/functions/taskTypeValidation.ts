import type { TaskItem, CreateTaskRequest, UpdateTaskRequest  } from "../types/tasks";

export function validateTaskItem(task: any): TaskItem {
  try {
    const result: TaskItem = {
      id: task.id,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      title: task.title,
      description: task.description || null,
      finishBy: task.finishBy ? new Date(task.finishBy) : null,
      completed: task.completed,
      completedAt: task.completedAt ? new Date(task.completedAt) : null,
    };
    return result;
  } catch (error) {
    console.error("Error validating task item:", error);
    throw error;
  }
}

export function validateCreateTaskRequest(task: any): CreateTaskRequest {
  try {
    const result: CreateTaskRequest = {
      title: task.title,
      description: task.description || null,
      finishBy: task.finishBy ? new Date(task.finishBy) : null,
    };
    return result;
  } catch (error) {
    console.error("Error validating create task request:", error);
    throw error;
  }
}

export function validateUpdateTaskRequest(task: any): UpdateTaskRequest {
  try {
    const result: UpdateTaskRequest = {
      id: task.id,
      title: task.title,
      description: task.description || null,
      finishBy: task.finishBy ? new Date(task.finishBy) : null,
    };
    return result;
  } catch (error) {
    console.error("Error validating update task request:", error);
    throw error;
  }
}
