import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { TaskItem, UpdateTaskRequest, loggedinUser, DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateUpdateTaskRequest, validateDoByUUIDRequest, validateTaskItem } from "@task-manager/common";
import { updateTask, deleteTask, getTaskById } from "../../db/queries/tasks";
import { canUserAccessTask, canUserModifyTask, canUserDeleteTask } from "@task-manager/common";

export async function handlerUpdateTask(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { taskId: string };
  const jsonBody = await req.json() as UpdateTaskRequest;
  const existingTask = await getTaskById(cfg.db, validateDoByUUIDRequest(reqParam.taskId));
  if (!canUserModifyTask(user.capabilities, existingTask)) {
    throw new UserForbiddenError("User not authorized");
  }

  const params: UpdateTaskRequest = validateUpdateTaskRequest({
    id: reqParam.taskId,
    title: jsonBody.title || existingTask.title,
    description: jsonBody.description || existingTask.description,
    finishBy: jsonBody.finishBy || existingTask.finishBy,
  });
  const result = await updateTask(cfg.db, params);
  return respondWithJSON(200, validateTaskItem(result) as TaskItem);
}

export async function handlerDeleteTask(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { taskId: string };
  const params: DoByUUIDRequest = validateDoByUUIDRequest(reqParam.taskId);
  const existingTask = await getTaskById(cfg.db, params);
  if (!canUserDeleteTask(user.capabilities, existingTask)) {
    throw new UserForbiddenError("User not authorized");
  }

  await deleteTask(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerGetTaskById(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { taskId: string };
  const params: DoByUUIDRequest = validateDoByUUIDRequest(reqParam.taskId);
  const task = await getTaskById(cfg.db, params);
  if (!canUserAccessTask(user.capabilities, task)) {
    throw new UserForbiddenError("User not authorized");
  }
  return respondWithJSON(200, validateTaskItem(task) as TaskItem);
}
