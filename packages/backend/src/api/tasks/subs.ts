import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { getTaskById, markDone } from "../../db/queries/tasks";

export async function handlerMarkDone(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const task = await getTaskById(cfg.db, idParam);
  /* if (!canUserCompleteTask(user.capabilities, task)) {
    throw new UserForbiddenError("User not authorized");
  } */
  if (!task.completed) await markDone(cfg.db, idParam);
  return c.body(null, 204);
}
