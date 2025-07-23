import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import type { TaskItem, UpdateTaskRequest, CreateTaskRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateTaskRequest, validateUpdateTaskRequest, validateDoByUUIDRequest, validateTaskItem, validateTaskItemArray } from "@task-manager/common";
import { createTask, getTasksByUserId, updateTask, deleteTask, getTaskById, markDone } from "../db/queries/tasks";
import { validate as validateUUID } from "uuid";
import { validateJWT, getAuthTokenFromHeaders } from "../lib/auth/authentication";

export async function handlerGetTasksByUserId(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('Invalid/malformed auth token');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const params = validateDoByUUIDRequest(userId);
  const tasks = await getTasksByUserId(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerCreateTask(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('Invalid/malformed auth token');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const params = await req.json() as CreateTaskRequest;
  params.userId = userId;
  const task = await createTask(cfg.db, validateCreateTaskRequest(params));
  return respondWithJSON(201, validateTaskItem(task));
}

export async function handlerUpdateTask(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('Invalid/malformed auth token');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const { taskId } = req.params as { taskId: string };
  if (!validateUUID(taskId)) {
    throw new BadRequestError("Invalid/malformed task ID");
  }
  const existingTask = await getTaskById(cfg.db, { id: taskId });
  if (!existingTask || existingTask.userId !== userId) {
    throw new UserForbiddenError("User not authorized");
  }

  const params = await req.json() as UpdateTaskRequest;
  params.id = taskId;
  const task = await updateTask(cfg.db, validateUpdateTaskRequest(params));
  return respondWithJSON(200, validateTaskItem(task));
}

export async function handlerDeleteTask(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('Invalid/malformed auth token');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const { taskId } = req.params as { taskId: string };
  const params = validateDoByUUIDRequest(taskId);
  const existingTask = await getTaskById(cfg.db, params);
  if (!existingTask || existingTask.userId !== userId) {
    throw new UserForbiddenError("User not authorized");
  }

  await deleteTask(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerGetTaskById(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('Invalid/malformed auth token');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const { taskId } = req.params as { taskId: string };
  const params = validateDoByUUIDRequest(taskId);
  const task = await getTaskById(cfg.db, params);
  if (!task || task.userId !== userId) {
    throw new UserForbiddenError("User not authorized");
  }
  return respondWithJSON(200, validateTaskItem(task));
}

export async function handlerMarkDone(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('Invalid/malformed auth token');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const { taskId } = req.params as { taskId: string };
  const params = validateDoByUUIDRequest(taskId);
  const result = await getTaskById(cfg.db, params);
  if (!result || result.userId !== userId) {
    throw new UserForbiddenError("User not authorized");
  }
  const existingTask = validateTaskItem(result);
  if (!existingTask.completed) await markDone(cfg.db, params);
  return respondWithJSON(204, {});
}
