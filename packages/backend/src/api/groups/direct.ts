import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import type { Group, UpdateGroupRequest, loggedinUser, DoByUUIDRequest } from "@task-manager/common";
import { validateDoByUUIDRequest, validateGroup, validateUpdateGroupRequest } from "@task-manager/common";
import { updateGroup, removeGroup, getGroupById } from "../../db/queries/groups";
import { canUserAccessGroup, canUserDeleteGroup } from "@task-manager/common";

export async function handlerUpdateGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const jsonBody = await req.json() as UpdateGroupRequest;

  const existingGroup = validateGroup(await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam)));
  if (!existingGroup) {
    throw new NotFoundError("Group not found");
  }

  const params = {
    id: reqParam.id,
    name: jsonBody.name || existingGroup.name,
    description: jsonBody.description || existingGroup.description,
  } as UpdateGroupRequest;

  const result = await updateGroup(cfg.db, validateUpdateGroupRequest(params));
  return respondWithJSON(200, validateGroup(result) as Group);
}

export async function handlerDeleteGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserDeleteGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  await removeGroup(cfg.db, reqParam);
  return respondWithJSON(204, {});
}

export async function handlerGetGroupById(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;

  const result = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!result) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserAccessGroup(user.capabilities, result)) {
    throw new UserForbiddenError("User not authorized");
  }

  return respondWithJSON(200, validateGroup(result) as Group);
}
