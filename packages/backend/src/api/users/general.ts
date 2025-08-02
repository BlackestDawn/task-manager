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
  const users = await getUsers(cfg.db);
  const result = users.filter(u => canUserAccessUser(user.capabilities, u));
  return respondWithJSON(200, validateUserArray(result));
}

export async function handlerCreateUser(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  if (!canUserCreateUser(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  }
  const jsonBody = await req.json() as CreateUserRequest;
  const params = {
    login: jsonBody.login,
    name: jsonBody.name,
    email: jsonBody.email,
    password: jsonBody.password,
  } as CreateUserRequest;
  const existingUser = await getUserByLogin(cfg.db, params.login);
  if (existingUser) {
    throw new AlreadyExistsConflictError("User already exists");
  }
  params.password = await hashPassword(params.password);
  const result = await createUser(cfg.db, validateCreateUserRequest(params)) as User;
  return respondWithJSON(201, validateUser(result));
}
