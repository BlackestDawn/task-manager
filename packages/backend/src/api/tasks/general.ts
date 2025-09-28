import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { Task, CreateTaskRequest, DoByUUIDRequest, User } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateTaskRequest, validateDoByUUIDRequest, validateTask, validateTaskArray } from "@task-manager/common";
import { createTask, getTasksByUserId } from "../../db/queries/tasks";

export async function handlerGetTasksByUserId(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  const body = await c.req.json() as DoByUUIDRequest;
  const tasks = await getTasksByUserId(cfg.db, validateDoByUUIDRequest(body.id || user.id));
  // const result = tasks.filter(t => canUserAccessTask(user.capabilities, t));
  const result = tasks;
  return c.json(validateTaskArray(result) as Task[]);
}

export async function handlerCreateTask(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  const jsonBody = await c.req.json() as CreateTaskRequest;
  /* if (!canUserCreateTask(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const createParams: CreateTaskRequest = validateCreateTaskRequest({
    ...jsonBody,
    userId: user.id,
  });
  const result = await createTask(cfg.db, createParams);
  return c.json(validateTask(result) as Task, 201);
}
