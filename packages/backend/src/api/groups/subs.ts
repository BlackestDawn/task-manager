import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import { NotFoundError, UserForbiddenError } from "@task-manager/common";
import type { AddUserToGroupRequest, RemoveUserFromGroupRequest, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest, DoByUUIDRequest, User } from "@task-manager/common";
import {
  validateUserArray, validateTaskArray,
  validateAddUserToGroupRequest, validateRemoveUserFromGroupRequest, validateAssignTaskToGroupRequest, validateRemoveTaskFromGroupRequest
} from "@task-manager/common";
import { getGroupById, getGroupMembers, getGroupTasks, assignTaskToGroup, removeTaskFromGroup, addUserToGroup, removeUserFromGroup } from "../../db/queries/groups";

export async function handlerGetGroupMembers(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const group = await getGroupById(cfg.db, idParam);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const abilities = c.get("capabilities");
  const members = await getGroupMembers(cfg.db, idParam);
  const result = members.filter(m => abilities.canViewObject(m));
  return c.json(validateUserArray(result));
}

export async function handlerGetGroupTasks(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const group = await getGroupById(cfg.db, idParam);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  const abilities = c.get("capabilities");
  const tasks = await getGroupTasks(cfg.db, idParam);
  const result = tasks.filter(t => abilities.canViewObject(t));
  return c.json(validateTaskArray(result));
}

export async function handlerAddUserToGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as AddUserToGroupRequest;

  const group = await getGroupById(cfg.db, idParam);
  if (!group) throw new NotFoundError("Group not found");

  const abilities = c.get("capabilities");
  if (!abilities.canAssignUser(group)) throw new UserForbiddenError("User not authorized");

  const params = {
    id: idParam.id,
    data: validateAddUserToGroupRequest(jsonBody) as AddUserToGroupRequest,
  };
  await addUserToGroup(cfg.db, params);
  return c.body(null, 204);
}

export async function handlerRemoveUserFromGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as RemoveUserFromGroupRequest;

  const group = await getGroupById(cfg.db, idParam);
  if (!group) throw new NotFoundError("Group not found");

  const abilities = c.get("capabilities");
  if (!abilities.canRemoveUser(group)) throw new UserForbiddenError("User not authorized");

  const params = {
    id: idParam.id,
    data: validateRemoveUserFromGroupRequest(jsonBody) as RemoveUserFromGroupRequest,
  };
  await removeUserFromGroup(cfg.db, params);
  return c.body(null, 204);
}

export async function handlerAssignTaskToGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as AssignTaskToGroupRequest;

  const group = await getGroupById(cfg.db, idParam);
  if (!group) throw new NotFoundError("Group not found");

  const abilities = c.get("capabilities");
  if (!abilities.canAssignTask(group)) throw new UserForbiddenError("User not authorized");

  const params = {
    id: idParam.id,
    data: validateAssignTaskToGroupRequest(jsonBody) as AssignTaskToGroupRequest,
  };
  await assignTaskToGroup(cfg.db, params);
  return c.body(null, 204);
}

export async function handlerRemoveTaskFromGroup(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as RemoveTaskFromGroupRequest;

  const group = await getGroupById(cfg.db, idParam);
  if (!group) throw new NotFoundError("Group not found");

  const abilities = c.get("capabilities");
  if (!abilities.canRemoveTask(group)) throw new UserForbiddenError("User not authorized");

  const params = {
    id: idParam.id,
    data: validateRemoveTaskFromGroupRequest(jsonBody) as RemoveTaskFromGroupRequest,
  };
  await removeTaskFromGroup(cfg.db, params);
  return c.body(null, 204);
}
