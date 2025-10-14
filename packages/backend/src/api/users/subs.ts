import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { User, Group, DoByUUIDRequest, Task, UpdatePasswordRequest, UpdateUserDisabledRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError, validateUser } from "@task-manager/common";
import { validateTaskArray, validateGroupArray, validateUpdatePasswordRequest, validateUpdateUserDisabledRequest } from "@task-manager/common";
import { getUserById, getGroupsForUser, updateUser, updatePassword, updateUserDisabledStatus } from "../../db/queries/users";
import { getAllTasksForUser } from "../../db/queries/tasks";
import { hashPassword } from "../../lib/auth/authentication";

export async function handlerGetTasksForUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const tasks = await getAllTasksForUser(cfg.db, idParam);
  return c.json(validateTaskArray(tasks) as Task[]);
}

export async function handlerGetGroupsForUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const groups = await getGroupsForUser(cfg.db, idParam);
  return c.json(validateGroupArray(groups) as Group[]);
}

export async function handlerUpdateUserPassword(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdatePasswordRequest;

  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserModifyUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  if (!jsonBody.password || jsonBody.password.length < 8) {
    throw new BadRequestError("Password must be at least 8 characters long");
  }

  const updateParams = {
    id: idParam.id,
    data: validateUpdatePasswordRequest({
      password: await hashPassword(jsonBody.password),
    }) as UpdatePasswordRequest,
  };
  const result = await updatePassword(cfg.db, updateParams) as User;
  return c.json(validateUser(result));
}

export async function handlerUpdateUserDisabled(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdateUserDisabledRequest;

  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserModifyUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */

  const updateParams = {
    id: idParam.id,
    data: validateUpdateUserDisabledRequest(jsonBody) as UpdateUserDisabledRequest,
  };
  const result = await updateUserDisabledStatus(cfg.db, updateParams) as User;
  return c.json(validateUser(result));
}
