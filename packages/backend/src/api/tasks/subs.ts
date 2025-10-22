import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, validateDoByUUIDRequest, validateUpdateTaskDoneStatusRequest } from "@task-manager/common";
import { updateTaskDoneStatus, getGroupsForTask, getTaskById } from "../../db/queries/tasks";

export async function handlerMarkDone(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const task = await getTaskById(cfg.db, idParam);

  const abilities = c.get("capabilities");
  if (!abilities.canViewObject(task)) throw new UserForbiddenError("User not authorized");

  const jsonBody = await c.req.json();
  if (!abilities.canEditObjectField(task, "completed")) throw new UserForbiddenError("User not authorized");

  const params = {
    id: idParam.id,
    data: validateUpdateTaskDoneStatusRequest(jsonBody),
  };
  const res = await updateTaskDoneStatus(cfg.db, params);
  return c.json(res, 200);
}

export async function handlerGetTaskGroups(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const task = await getTaskById(cfg.db, idParam);

  const abilities = c.get("capabilities");
  if (!abilities.canViewObject(task)) throw new UserForbiddenError("User not authorized");

  const params = validateDoByUUIDRequest(idParam);
  const res = await getGroupsForTask(cfg.db, params);
  return c.json(res, 200);
}
