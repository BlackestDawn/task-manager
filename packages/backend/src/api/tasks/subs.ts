import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { loggedinUser, DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateDoByUUIDRequest } from "@task-manager/common";
import { getTaskById, markDone } from "../../db/queries/tasks";
import { canUserCompleteTask } from "@task-manager/common";

export async function handlerMarkDone(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const task = await getTaskById(cfg.db, validateDoByUUIDRequest(reqParam));
  if (!canUserCompleteTask(user.capabilities, task)) {
    throw new UserForbiddenError("User not authorized");
  }
  if (!task.completed) await markDone(cfg.db, reqParam);
  return respondWithJSON(204, {});
}
