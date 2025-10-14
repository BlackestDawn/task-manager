import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import type { Group, CreateGroupRequest, User } from "@task-manager/common";
import { validateGroup, validateGroupArray, validateCreateGroupRequest, validateDoByUUIDRequest } from "@task-manager/common";
import { createGroup, getGroups } from "../../db/queries/groups";

export async function handlerCreateGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const jsonBody = await c.req.json() as CreateGroupRequest;
  /* if (!canUserCreateGroup(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const createParams: CreateGroupRequest = validateCreateGroupRequest({
    ...jsonBody,
  })
  const result = await createGroup(cfg.db, createParams);
  return c.json(validateGroup(result) as Group, 201);
}

export async function handlerGetGroups(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const groups = await getGroups(cfg.db);
  // const result = groups.filter(g => canUserAccessGroup(user.capabilities, g));
  const result = groups;
  return c.json(validateGroupArray(result) as Group[]);
}
