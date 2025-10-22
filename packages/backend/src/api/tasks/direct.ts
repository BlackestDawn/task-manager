import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { Task, UpdateTaskRequest, DoByUUIDRequest } from "@task-manager/common";
import { validateUpdateTaskRequest, validateTask, UserForbiddenError } from "@task-manager/common";
import { updateTask, deleteTask, getTaskById } from "../../db/queries/tasks";

export async function handlerUpdateTask(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdateTaskRequest;
  const existingTask = await getTaskById(cfg.db, idParam);

  const abilities = c.get("capabilities");
  if (!abilities.canEditObject(existingTask)) throw new UserForbiddenError("User not authorized");

  const params = {
    id: idParam.id,
    data: validateUpdateTaskRequest(jsonBody) as UpdateTaskRequest,
  };
  const result = await updateTask(cfg.db, params);
  return c.json(validateTask(result) as Task);
}

export async function handlerDeleteTask(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingTask = await getTaskById(cfg.db, idParam);

  const abilities = c.get("capabilities");
  if (!abilities.canDeleteObject(existingTask)) throw new UserForbiddenError("User not authorized");

  await deleteTask(cfg.db, idParam);
  return c.body(null, 204);
}

export async function handlerGetTaskById(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const task = await getTaskById(cfg.db, idParam);

  const abilities = c.get("capabilities");
  if (!abilities.canViewObject(task)) throw new UserForbiddenError("User not authorized");

  return c.json(validateTask(task) as Task);
}
