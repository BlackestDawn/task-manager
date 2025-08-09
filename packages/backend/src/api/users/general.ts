import { type ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, CreateUserRequest, loggedinUser } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateCreateUserRequest, validateUser, validateUserArray } from "@task-manager/common";
import { createUser, getUsers, getUserByLogin } from "../../db/queries/users";
import { hashPassword } from "../../lib/auth/authentication";
import { canUserAccessUser, canUserCreateUser } from "@task-manager/common";

export async function handlerGetUsers(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const users = await getUsers(cfg.db) as User[];
  const result = users.filter(u => {
    const canAccess = canUserAccessUser(user.capabilities, u)
    return canAccess;
  });
  return respondWithJSON(200, validateUserArray(result));
}

export async function handlerCreateUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  if (!canUserCreateUser(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  }
  const jsonBody = await req.json() as CreateUserRequest;
  const params: CreateUserRequest = validateCreateUserRequest({
    login: jsonBody.login,
    name: jsonBody.name,
    email: jsonBody.email,
    password: await hashPassword(jsonBody.password),
  });
  const result = await createUser(cfg.db, params) as User;
  return respondWithJSON(201, validateUser(result));
}
