import { type ApiConfig } from "../config";
import { respondWithJSON } from "../utils/response";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import type { BunRequest } from "bun";
import type { TaskItem, UpdateTaskRequest, CreateTaskRequest } from "@task-manager/common";
import { createTask, getTasks, updateTask, deleteTask, getTaskById, markDone } from "../db/queries/tasks";

export async function handlerGetTasks(cfg: ApiConfig, req: BunRequest) {
  const tasks = await getTasks(cfg.db);
  // console.log(`returning ${tasks.length} tasks`);

  return respondWithJSON(200, tasks);
}

export async function handlerCreateTask(cfg: ApiConfig, req: BunRequest) {
  const body = await req.json() as CreateTaskRequest;
  const task = await createTask(cfg.db, body);
  return respondWithJSON(201, task);
}

export async function handlerUpdateTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId?: string };
  if (!taskId) {
    throw new BadRequestError("Invalid task ID");
  }
  const params = await req.json() as UpdateTaskRequest;
  params.id = taskId;
  const task = await updateTask(cfg.db, params);
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
