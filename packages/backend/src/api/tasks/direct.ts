import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { Task, UpdateTaskRequest, DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateUpdateTaskRequest, validateTask } from "@task-manager/common";
import { updateTask, deleteTask, getTaskById } from "../../db/queries/tasks";

export async function handlerUpdateTask(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdateTaskRequest;
  const existingTask = await getTaskById(cfg.db, idParam);
  /* if (!canUserModifyTask(user.capabilities, existingTask)) {
    throw new UserForbiddenError("User not authorized");
  } */

  const params: UpdateTaskRequest = validateUpdateTaskRequest({
    id: idParam.id,
    title: jsonBody.title || existingTask.title,
    description: jsonBody.description || existingTask.description,
    finishBy: jsonBody.finishBy || existingTask.finishBy,
  });
  const result = await updateTask(cfg.db, params);
  return c.json(validateTask(result) as Task);
}

export async function handlerDeleteTask(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingTask = await getTaskById(cfg.db, idParam);
  /* if (!canUserDeleteTask(user.capabilities, existingTask)) {
    throw new UserForbiddenError("User not authorized");
  } */

  await deleteTask(cfg.db, idParam);
  return c.body(null, 204);
}

export async function handlerGetTaskById(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const task = await getTaskById(cfg.db, idParam);
  /* if (!canUserAccessTask(user.capabilities, task)) {
    throw new UserForbiddenError("User not authorized");
  } */
  return c.json(validateTask(task) as Task);
}
