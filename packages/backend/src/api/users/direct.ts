import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, UpdateUserRequest, DoByUUIDRequest, loggedinUser } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateUpdateUserRequest, validateDoByUUIDRequest, validateUser } from "@task-manager/common";
import { updateUser, deleteUser, getUserById } from "../../db/queries/users";
import { canUserAccessUser, canUserDeleteUser, canUserModifyUser } from "@task-manager/common";

export async function handlerUpdateUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as UpdateUserRequest;
  const reqParam = req.params as { userId: string };
  const params = {
    id: reqParam.userId,
    name: jsonBody.name,
    email: jsonBody.email,
    login: jsonBody.login,
  } as UpdateUserRequest;
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  if (!canUserModifyUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  }
  const updateParams = {
    id: reqParam.userId,
    name: params.name || existingUser.name,
    email: params.email || existingUser.email,
    login: params.login || existingUser.login,
  }
  const result = await updateUser(cfg.db, validateUpdateUserRequest(updateParams)) as User;
  return respondWithJSON(200, validateUser(result));
}

export async function handlerDeleteUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const params = validateDoByUUIDRequest(reqParam);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (existingUser) {
    if (!canUserDeleteUser(user.capabilities, existingUser)) {
      throw new UserForbiddenError("User not authorized");
    }
    await deleteUser(cfg.db, params);
  }
  return respondWithJSON(204, {});
}

export async function handlerGetUserById(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const reqParam = req.params as DoByUUIDRequest;
  const params = validateDoByUUIDRequest(reqParam);
  const existingUser = await getUserById(cfg.db, params) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  }
  return respondWithJSON(200, validateUser(existingUser));
}
