import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { DoByUUIDRequest } from "@task-manager/common";
import { validateDoByUUIDRequest, validateUpdateTaskDoneStatusRequest } from "@task-manager/common";
import { updateTaskDoneStatus, getGroupsForTask } from "../../db/queries/tasks";

export async function handlerMarkDone(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json();
  /* if (!canUserCompleteTask(user.capabilities, task)) {
    throw new UserForbiddenError("User not authorized");
  } */
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
  const params = validateDoByUUIDRequest(idParam);
  const res = await getGroupsForTask(cfg.db, params);
  return c.json(res, 200);
}
