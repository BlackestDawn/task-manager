import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import type { Group, CreateGroupRequest, loggedinUser } from "@task-manager/common";
import { validateGroup, validateGroupArray, validateCreateGroupRequest } from "@task-manager/common";
import { createGroup, checkExistingGroup, getGroups } from "../../db/queries/groups";
import { canUserAccessGroup, canUserCreateGroup } from "@task-manager/common";

export async function handlerCreateGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as CreateGroupRequest;
  if (!canUserCreateGroup(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  }

  const existingGroup = await checkExistingGroup(cfg.db, jsonBody.name);
  if (existingGroup) {
    throw new AlreadyExistsConflictError("Group already exists");
  }

  const result = await createGroup(cfg.db, validateCreateGroupRequest(jsonBody));
  return respondWithJSON(201, validateGroup(result) as Group);
}

export async function handlerGetGroups(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const groups = await getGroups(cfg.db);
  const result = groups.filter(g => canUserAccessGroup(user.capabilities, g));
  return respondWithJSON(200, validateGroupArray(result) as Group[]);
}
