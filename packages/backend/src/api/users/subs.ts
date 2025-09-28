import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { User, Group, DoByUUIDRequest, Task } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateTaskArray, validateGroupArray } from "@task-manager/common";
import { getUserById, getGroupsForUser } from "../../db/queries/users";
import { getAllTasksForUser } from "../../db/queries/tasks";

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
