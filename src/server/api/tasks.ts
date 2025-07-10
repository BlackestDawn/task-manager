import { ApiConfig } from "../config";
import { respondWithJSON } from "./json";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "./errors";
import type { BunRequest } from "bun";
import type { TaskItem, TaskItemUpdateRequest, TaskItemCreateRequest } from "../db/types";
import { createTask, getTasks, updateTask, deleteTask, getTaskById, markDone } from "../db/tasks";

export async function handlerGetTasks(cfg: ApiConfig, req: BunRequest) {
  const tasks = getTasks(cfg.db) as TaskItem[];
  return respondWithJSON(200, tasks);
}

export async function handlerCreateTask(cfg: ApiConfig, req: BunRequest) {
  const body = await req.json() as TaskItemCreateRequest;
  const task = createTask(cfg.db, body) as TaskItem;
  return respondWithJSON(201, task);
}

export async function handlerUpdateTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  const body = await req.json();
  const params: TaskItemUpdateRequest = { taskId, ...body };
  const task = updateTask(cfg.db, params) as TaskItem;
  return respondWithJSON(200, task);
}

export async function handlerDeleteTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  deleteTask(cfg.db, taskId);
  return respondWithJSON(204, {});
}

export async function handlerGetTaskById(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  const task = getTaskById(cfg.db, taskId) as TaskItem;
  return respondWithJSON(200, task);
}

export async function handlerMarkDone(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  markDone(cfg.db, taskId);
  return respondWithJSON(204, {});
}
