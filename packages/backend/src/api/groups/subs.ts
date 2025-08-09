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
  const reqParam = req.params as DoByUUIDRequest;
  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const members = await getGroupMembers(cfg.db, reqParam);
  return respondWithJSON(200, validateUserArray(members));
}

export async function handlerGetGroupTasks(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const tasks = await getGroupTasks(cfg.db, reqParam);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerAddUserToGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const jsonBody = await req.json() as AddUserToGroupRequest;
  jsonBody.groupId = reqParam.id;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserAssignToGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  const result = await addUserToGroup(cfg.db, validateAddUserToGroupRequest(jsonBody));
  return respondWithJSON(201, result);
}

export async function handlerRemoveUserFromGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const jsonBody = await req.json() as RemoveUserFromGroupRequest;
  jsonBody.groupId = reqParam.id;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserRemoveFromGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  await removeUserFromGroup(cfg.db, validateRemoveUserFromGroupRequest(jsonBody));
  return respondWithJSON(204, {});
}

export async function handlerAssignTaskToGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const jsonBody = await req.json() as AssignTaskToGroupRequest;
  jsonBody.groupId = reqParam.id;
  jsonBody.assignedBy = user.userInfo.id;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserAssignToGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  const result = await assignTaskToGroup(cfg.db, validateAssignTaskToGroupRequest(jsonBody));
  return respondWithJSON(201, result);
}

export async function handlerRemoveTaskFromGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const jsonBody = await req.json() as RemoveTaskFromGroupRequest;
  jsonBody.groupId = reqParam.id;

  const group = await getGroupById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  if (!canUserRemoveFromGroup(user.capabilities, group)) {
    throw new UserForbiddenError("User not authorized");
  }

  await removeTaskFromGroup(cfg.db, validateRemoveTaskFromGroupRequest(jsonBody));
  return respondWithJSON(204, {});
}
