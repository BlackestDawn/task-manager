import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { getAndValidateUser } from "../lib/auth/authentication";
import type { CreateGroupRequest, UpdateGroupRequest, AddUserToGroupRequest, RemoveUserFromGroupRequest, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest } from "@task-manager/common";
import { validateDoByUUIDRequest, validateGroup, validateGroupArray, validateUserArray, validateTaskItemArray, validateCreateGroupRequest, validateUpdateGroupRequest,
  validateAddUserToGroupRequest, validateRemoveUserFromGroupRequest, validateAssignTaskToGroupRequest, validateRemoveTaskFromGroupRequest } from "@task-manager/common";
import { createGroup, updateGroup, removeGroup, getGroupById, checkExistingGroup, getGroups, getGroupMembers, getGroupTasks, assignTaskToGroup, removeTaskFromGroup, addUserToGroup, removeUserFromGroup, checkExistingUserInGroup, checkExistingTaskInGroup } from "../db/queries/groups";

export async function handlerCreateGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = await req.json() as CreateGroupRequest;
  params.createdBy = userId;

  const existingGroup = await checkExistingGroup(cfg.db, params.name);
  if (existingGroup) {
    throw new AlreadyExistsConflictError("Group already exists");
  }

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

export async function handlerGetGroupMembers(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = validateDoByUUIDRequest(groupId);

  const group = await getGroupById(cfg.db, params);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const members = await getGroupMembers(cfg.db, params);
  return respondWithJSON(200, validateUserArray(members));
}

export async function handlerGetGroupTasks(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = validateDoByUUIDRequest(groupId);

  const group = await getGroupById(cfg.db, params);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const tasks = await getGroupTasks(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerAddUserToGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = await req.json() as AddUserToGroupRequest;
  params.groupId = groupId;

  const existing = await checkExistingUserInGroup(cfg.db, params);
  if (existing) {
    throw new AlreadyExistsConflictError("User already in group");
  }

  const group = await addUserToGroup(cfg.db, validateAddUserToGroupRequest(params));
  return respondWithJSON(201, group);
}

export async function handlerRemoveUserFromGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = await req.json() as RemoveUserFromGroupRequest;
  params.groupId = groupId;

  const group = await removeUserFromGroup(cfg.db, validateRemoveUserFromGroupRequest(params));
  return respondWithJSON(204, {});
}

export async function handlerAssignTaskToGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = await req.json() as AssignTaskToGroupRequest;
  params.groupId = groupId;
  params.assignedBy = userId;

  const existing = await checkExistingTaskInGroup(cfg.db, params);
  if (existing) {
    throw new AlreadyExistsConflictError("Task already assigned to group");
  }

  const group = await assignTaskToGroup(cfg.db, validateAssignTaskToGroupRequest(params));
  return respondWithJSON(201, group);
}

export async function handlerRemoveTaskFromGroup(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const { groupId } = req.params as { groupId: string };
  const params = await req.json() as RemoveTaskFromGroupRequest;
  params.groupId = groupId;

  const group = await removeTaskFromGroup(cfg.db, validateRemoveTaskFromGroupRequest(params));
  return respondWithJSON(204, {});
}
