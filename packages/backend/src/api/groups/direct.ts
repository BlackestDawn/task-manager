import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import { NotFoundError, UserForbiddenError } from "@task-manager/common";
import type { DoByUUIDRequest, Group, UpdateGroupRequest } from "@task-manager/common";
import { validateGroup, validateUpdateGroupRequest } from "@task-manager/common";
import { updateGroup, removeGroup, getGroupById } from "../../db/queries/groups";

export async function handlerUpdateGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdateGroupRequest;

  const existingGroup = validateGroup(await getGroupById(cfg.db, idParam));
  if (!existingGroup) {
    throw new NotFoundError("Group not found");
  }

  const abilities = c.get("capabilities");
  if (!abilities.canEditObject(existingGroup)) throw new UserForbiddenError("User not authorized");

  const updateParams = {
    id: idParam.id,
    data: validateUpdateGroupRequest(jsonBody) as UpdateGroupRequest,
  };

  const result = await updateGroup(cfg.db, updateParams);
  return c.json(validateGroup(result) as Group);
}

export async function handlerDeleteGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const group = await getGroupById(cfg.db, idParam);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const abilities = c.get("capabilities");
  if (!abilities.canDeleteObject(group)) throw new UserForbiddenError("User not authorized");

  await removeGroup(cfg.db, idParam);
  return c.body(null, 204);
}

export async function handlerGetGroupById(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const result = await getGroupById(cfg.db, idParam);
  if (!result) {
    throw new NotFoundError("Group not found");
  }

  const abilities = c.get("capabilities");
  if (!abilities.canViewObject(result)) throw new UserForbiddenError("User not authorized");

  return c.json(validateGroup(result) as Group);
}
