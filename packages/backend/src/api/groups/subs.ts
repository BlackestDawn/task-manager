import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import type { AddUserToGroupRequest, RemoveUserFromGroupRequest, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest, loggedinUser, DoByUUIDRequest } from "@task-manager/common";
import { validateDoByUUIDRequest, validateUserArray, validateTaskItemArray,
  validateAddUserToGroupRequest, validateRemoveUserFromGroupRequest, validateAssignTaskToGroupRequest, validateRemoveTaskFromGroupRequest } from "@task-manager/common";
import { getGroupById, getGroupMembers, getGroupTasks, assignTaskToGroup, removeTaskFromGroup, addUserToGroup, removeUserFromGroup } from "../../db/queries/groups";
import { canUserAssignToGroup, canUserRemoveFromGroup } from "@task-manager/common";

export async function handlerGetGroupMembers(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { groupId: string };
  const params: DoByUUIDRequest = validateDoByUUIDRequest(reqParam.groupId);
  const group = await getGroupById(cfg.db, params);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  const members = await getGroupMembers(cfg.db, params);
  return respondWithJSON(200, validateUserArray(members));
}

export async function handlerGetGroupTasks(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { groupId: string };
  const params: DoByUUIDRequest = validateDoByUUIDRequest(reqParam.groupId);
  const group = await getGroupById(cfg.db, params);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const tasks = await getGroupTasks(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerAddUserToGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { groupId: string };
  const jsonBody = await req.json() as AddUserToGroupRequest;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam.groupId));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserAssignToGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  const params: AddUserToGroupRequest = validateAddUserToGroupRequest({
    ...jsonBody,
    groupId: reqParam.groupId,
  });
  const result = await addUserToGroup(cfg.db, params);
  return respondWithJSON(201, result);
}

export async function handlerRemoveUserFromGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { groupId: string };
  const jsonBody = await req.json() as RemoveUserFromGroupRequest;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam.groupId));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserRemoveFromGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  const params: RemoveUserFromGroupRequest = validateRemoveUserFromGroupRequest({
    ...jsonBody,
    groupId: reqParam.groupId,
  });
  await removeUserFromGroup(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerAssignTaskToGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { groupId: string };
  const jsonBody = await req.json() as AssignTaskToGroupRequest;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam.groupId));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserAssignToGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  const params: AssignTaskToGroupRequest = validateAssignTaskToGroupRequest({
    ...jsonBody,
    groupId: reqParam.groupId,
    assignedBy: user.userInfo.id,
  });
  const result = await assignTaskToGroup(cfg.db, params);
  return respondWithJSON(201, result);
}

export async function handlerRemoveTaskFromGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as { groupId: string };
  const jsonBody = await req.json() as RemoveTaskFromGroupRequest;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam.groupId));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserRemoveFromGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  const params: RemoveTaskFromGroupRequest = validateRemoveTaskFromGroupRequest({
    ...jsonBody,
    groupId: reqParam.groupId,
  });
  await removeTaskFromGroup(cfg.db, validateRemoveTaskFromGroupRequest(jsonBody));
  return respondWithJSON(204, {});
}
