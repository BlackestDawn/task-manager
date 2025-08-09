import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { TaskItem, CreateTaskRequest, loggedinUser, DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateTaskRequest, validateDoByUUIDRequest, validateTaskItem, validateTaskItemArray } from "@task-manager/common";
import { createTask, getTasksByUserId } from "../../db/queries/tasks";
import { canUserAccessTask, canUserCreateTask } from "@task-manager/common";

export async function handlerGetTasksByUserId(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const tasks = await getTasksByUserId(cfg.db, validateDoByUUIDRequest(reqParam));
  const result = tasks.filter(t => canUserAccessTask(user.capabilities, t));
  return respondWithJSON(200, validateTaskItemArray(result) as TaskItem[]);
}

export async function handlerCreateTask(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as CreateTaskRequest;
  if (!canUserCreateTask(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  }
  const params: CreateTaskRequest = validateCreateTaskRequest({
    ...jsonBody,
    userId: user.userInfo.id,
  });
  const result = await createTask(cfg.db, validateCreateTaskRequest(jsonBody));
  return respondWithJSON(201, validateTaskItem(result) as TaskItem);
}
