import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { Task, CreateTaskRequest, User } from "@task-manager/common";
import { UserForbiddenError, validateCreateTaskRequest, validateDoByUUIDRequest, validateTask, validateTaskArray } from "@task-manager/common";
import { createTask, getAllTasksForUser, getAllTasks } from "../../db/queries/tasks";

export async function handlerGetTasksByUserId(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  let tasks;
  if (user.accessLevel === 'admin') {
    tasks = await getAllTasks(cfg.db);
  } else {
    tasks = await getAllTasksForUser(cfg.db, validateDoByUUIDRequest(user.id));
  }

  const abilities = c.get("capabilities");
  const result = tasks.filter(t => abilities.canViewObject(t));
  return c.json(validateTaskArray(result) as Task[]);
}

export async function handlerCreateTask(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  const jsonBody = await c.req.json() as CreateTaskRequest;

  const abilities = c.get("capabilities");
  if (!abilities.canCreateObject("Task")) throw new UserForbiddenError("User not authorized");

  const createParams: CreateTaskRequest = validateCreateTaskRequest({
    ...jsonBody,
    userId: user.id,
  });
  const result = await createTask(cfg.db, createParams);
  return c.json(validateTask(result) as Task, 201);
}
