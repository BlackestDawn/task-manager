import { type ApiConfig } from "../config";
import { respondWithJSON } from "../utils/response";
import type { BunRequest } from "bun";
import type { TaskItem, UpdateTaskRequest, CreateTaskRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateTaskRequest, validateUpdateTaskRequest } from "@task-manager/common";
import { createTask, getTasks, updateTask, deleteTask, getTaskById, markDone } from "../db/queries/tasks";

export async function handlerGetTasks(cfg: ApiConfig, req: BunRequest) {
  const tasks = await getTasks(cfg.db);
  return respondWithJSON(200, tasks);
}

export async function handlerCreateTask(cfg: ApiConfig, req: BunRequest) {
  const params = await req.json() as CreateTaskRequest;
  const task = await createTask(cfg.db, validateCreateTaskRequest(params));
  return respondWithJSON(201, task);
}

export async function handlerUpdateTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  const params = await req.json() as UpdateTaskRequest;
  params.id = taskId;
  const task = await updateTask(cfg.db, validateUpdateTaskRequest(params));
  return respondWithJSON(200, task);
}

export async function handlerDeleteTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  await deleteTask(cfg.db, taskId);
  return respondWithJSON(204, {});
}

export async function handlerGetTaskById(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  const task = await getTaskById(cfg.db, taskId);
  return respondWithJSON(200, task);
}

export async function handlerMarkDone(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  const existingTask = await getTaskById(cfg.db, taskId);
  if (!existingTask.completed) await markDone(cfg.db, taskId);
  return respondWithJSON(204, {});
}
