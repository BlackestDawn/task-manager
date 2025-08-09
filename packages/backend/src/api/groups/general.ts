import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import type { Group, CreateGroupRequest, loggedinUser } from "@task-manager/common";
import { validateGroup, validateGroupArray, validateCreateGroupRequest, validateDoByUUIDRequest } from "@task-manager/common";
import { createGroup, getGroups } from "../../db/queries/groups";
import { canUserAccessGroup, canUserCreateGroup } from "@task-manager/common";
import { getGroupsForUser } from "../../db/queries/users";

export async function handlerCreateGroup(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as CreateGroupRequest;
  if (!canUserCreateGroup(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  }
  const params: CreateGroupRequest = validateCreateGroupRequest({
    ...jsonBody,
  })
  const result = await createGroup(cfg.db, params);
  return respondWithJSON(201, validateGroup(result) as Group);
}

export async function handlerGetAllGroups(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const groups = await getGroups(cfg.db);
  const result = groups.filter(g => canUserAccessGroup(user.capabilities, g));
  return respondWithJSON(200, validateGroupArray(result) as Group[]);
}

export async function handlerGetGroupsForSelf(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const params = validateDoByUUIDRequest(user.userInfo.id);
  const groups = await getGroupsForUser(cfg.db, params);
  return respondWithJSON(200, validateGroupArray(groups) as Group[]);
}
