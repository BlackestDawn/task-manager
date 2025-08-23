import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, DoByUUIDRequest, loggedinUser } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateDoByUUIDRequest, validateUser, validateTaskArray } from "@task-manager/common";
import { getUserById, getGroupsForUser, disabledUser } from "../../db/queries/users";
import { getAllTasksForUser } from "../../db/queries/tasks";

export async function handlerGetTasksForUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const params: DoByUUIDRequest = validateDoByUUIDRequest(req.params);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const tasks = await getAllTasksForUser(cfg.db, params);
  return respondWithJSON(200, validateTaskArray(tasks));
}

export async function handlerGetGroupsForUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const params: DoByUUIDRequest = validateDoByUUIDRequest(req.params);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const tasks = await getGroupsForUser(cfg.db, params);
  return respondWithJSON(200, validateTaskArray(tasks));
}
