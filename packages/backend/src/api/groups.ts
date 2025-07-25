import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { getAndValidateUser } from "../lib/auth/authentication";
import type { CreateGroupRequest, UpdateGroupRequest, AddOrRemoveUserToGroupRequest, AssignOrRemoveTaskToGroupRequest } from "@task-manager/common";
import { validateDoByUUIDRequest, validateGroup, validateGroupArray, validateUserArray, validateTaskItemArray, validateCreateGroupRequest, validateUpdateGroupRequest, validateAddUserOrRemoveToGroupRequest, validateAssignOrRemoveTaskToGroupRequest } from "@task-manager/common";
import { createGroup, updateGroup, removeGroup, getGroupById, getGroups } from "../db/queries/groups";

export async function handlerCreateGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = await req.json() as CreateGroupRequest;
  params.createdBy = userId;

  const group = await createGroup(cfg.db, validateCreateGroupRequest(params));
  return respondWithJSON(201, validateGroup(group));
}

export async function handlerUpdateGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const input = await req.json() as UpdateGroupRequest;

  const existingGroup = validateGroup(await getGroupById(cfg.db, validateDoByUUIDRequest(groupId)));
  if (!existingGroup) {
    throw new NotFoundError("Group not found");
  }

  const params = {
    id: groupId,
    name: input.name || existingGroup.name,
    description: input.description || existingGroup.description,
    role: input.role || existingGroup.role,
  } as UpdateGroupRequest;

  const group = await updateGroup(cfg.db, validateUpdateGroupRequest(params));
  return respondWithJSON(200, validateGroup(group));
}

export async function handlerDeleteGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = validateDoByUUIDRequest(groupId);

  const group = await getGroupById(cfg.db, params);
  if (!group || group.createdBy !== userId) {
    throw new UserForbiddenError("User not authorized");
  }

  await removeGroup(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerGetGroupById(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = validateDoByUUIDRequest(groupId);

  const group = await getGroupById(cfg.db, params);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  return respondWithJSON(200, validateGroup(group));
}

export async function handlerGetGroups(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const groups = await getGroups(cfg.db);
  return respondWithJSON(200, validateGroupArray(groups));
}