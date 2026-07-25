import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { Group, CreateGroupRequest } from "@task-manager/common";
import { validateGroup, validateGroupArray, validateCreateGroupRequest, UserForbiddenError } from "@task-manager/common";
import { createGroup, getGroups } from "../../db/queries/groups";

export async function handlerCreateGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const jsonBody = await c.req.json() as CreateGroupRequest;
  const abilities = c.get("capabilities");
  if (!abilities.canCreateObject("Group")) throw new UserForbiddenError("User not authorized");

  const createParams: CreateGroupRequest = validateCreateGroupRequest({
    ...jsonBody,
  })
  const result = await createGroup(cfg.db, createParams);
  return c.json(validateGroup(result) as Group, 201);
}

export async function handlerGetGroups(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const groups = await getGroups(cfg.db);
  const abilities = c.get("capabilities");
  const result = groups.filter(g => abilities.canViewObject(g));
  return c.json(validateGroupArray(result) as Group[]);
}
