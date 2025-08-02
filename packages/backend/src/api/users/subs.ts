import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, UpdatePasswordRequest, disabledUserRequest, DoByUUIDRequest, loggedinUser } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateUpdatePasswordRequest, validateDoByUUIDRequest, validateUser, validateTaskItemArray, validateDisabledUserRequest } from "@task-manager/common";
import { getUserById, updatePassword, getTasksForUser, getGroupsForUser, disabledUser } from "../../db/queries/users";
import { hashPassword } from "../../lib/auth/authentication";
import { canUserAccessUser, canUserModifyPassword, canUserModifyDisabled } from "@task-manager/common";

export async function handlerUpdateUserPassword(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as { password: string };
  const reqParam = req.params as DoByUUIDRequest;
  const params = {
    id: reqParam.id,
    password: await hashPassword(jsonBody.password),
  } as UpdatePasswordRequest;
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  if (!canUserModifyPassword(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  }
  const result = await updatePassword(cfg.db, validateUpdatePasswordRequest(params));
  return respondWithJSON(200, validateUser(result));
}

export async function handlerGetTasksForUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const params = validateDoByUUIDRequest(reqParam);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  }
  const tasks = await getTasksForUser(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerGetGroupsForUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const params = validateDoByUUIDRequest(reqParam);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  }
  const tasks = await getGroupsForUser(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerDisabledUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as disabledUserRequest;
  const params = validateDisabledUserRequest(reqParam);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  if (!canUserModifyDisabled(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  }
  const result = await disabledUser(cfg.db, validateDisabledUserRequest(params));
  return respondWithJSON(200, validateUser(result));
}
