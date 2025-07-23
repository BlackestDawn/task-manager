import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import type { TaskItem, UpdateTaskRequest, CreateTaskRequest, GetTasksRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateTaskRequest, validateUpdateTaskRequest, validateDoByUUIDRequest } from "@task-manager/common";
import { createTask, getTasksByUserId, updateTask, deleteTask, getTaskById, markDone } from "../db/queries/tasks";
import { validate as validateUUID } from "uuid";

export async function handlerGetTasksByUserId(cfg: ApiConfig, req: BunRequest) {
  const params = await req.json() as GetTasksRequest;
  const tasks = await getTasksByUserId(cfg.db, params);
  return respondWithJSON(200, tasks);
}

export async function handlerCreateTask(cfg: ApiConfig, req: BunRequest) {
  const params = await req.json() as CreateTaskRequest;
  const task = await createTask(cfg.db, validateCreateTaskRequest(params));
  return respondWithJSON(201, task);
}

export async function handlerUpdateTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId: string };
  if (!validateUUID(taskId)) {
    throw new BadRequestError("Invalid/malformed task ID");
  }
  const params = await req.json() as UpdateTaskRequest;
  params.id = taskId;
  const task = await updateTask(cfg.db, validateUpdateTaskRequest(params));
  return respondWithJSON(200, task);
}

export async function handlerDeleteTask(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId: string };
  const params = validateDoByUUIDRequest(taskId);
  await deleteTask(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerGetTaskById(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId: string };
  const params = validateDoByUUIDRequest(taskId);
  const task = await getTaskById(cfg.db, params);
  return respondWithJSON(200, task);
}

export async function handlerMarkDone(cfg: ApiConfig, req: BunRequest) {
  const { taskId } = req.params as { taskId: string };
  const params = validateDoByUUIDRequest(taskId);
  const existingTask = await getTaskById(cfg.db, params);
  if (!existingTask.completed) await markDone(cfg.db, params);
  return respondWithJSON(204, {});
}
