import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, UpdateUserRequest, CreateUserRequest, UpdatePasswordRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateUserRequest, validateUpdateUserRequest, validateUpdatePasswordRequest, validateDoByUUIDRequest, validateUser, validateUserArray } from "@task-manager/common";
import { createUser, updateUser, deleteUser, getUsers, getUserById, getUserByLogin, updatePassword } from "../db/queries/users";
import { validate as validateUUID } from "uuid";
import { hashPassword, getAuthTokenFromHeaders, validateJWT } from "../lib/auth/authentication";

export async function handlerGetUsers(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('User not authorized');
  }

  const userId = await validateJWT(bearerToken);
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }

  const users = await getUsers(cfg.db);
  return respondWithJSON(200, validateUserArray(users));
}

export async function handlerCreateUser(cfg: ApiConfig, req: BunRequest) {
  const paramsRaw = await req.json() as CreateUserRequest;
  const params = validateCreateUserRequest(paramsRaw);
  const existingUser = await getUserByLogin(cfg.db, params.login);
  if (existingUser) {
    throw new BadRequestError("User already exists");
  }
  params.password = await hashPassword(params.password);
  const user = await createUser(cfg.db, params) as User;
  return respondWithJSON(201, validateUser(user));
}

export async function handlerUpdateUser(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('User not authorized');
  }
  const userId = await validateJWT(bearerToken);

  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }
  const params = await req.json() as UpdateUserRequest;
  params.id = userId;
  const user = await updateUser(cfg.db, validateUpdateUserRequest(params));
  return respondWithJSON(200, validateUser(user));
}

export async function handlerUpdateUserPassword(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('User not authorized');
  }
  const userId = await validateJWT(bearerToken);

  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }
  const params = await req.json() as UpdatePasswordRequest;
  params.id = userId;
  const user = await updatePassword(cfg.db, validateUpdatePasswordRequest(params));
  return respondWithJSON(200, validateUser(user));
}

export async function handlerDeleteUser(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('User not authorized');
  }
  const userId = await validateJWT(bearerToken);

  const params = validateDoByUUIDRequest(userId);
  await deleteUser(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerGetUserById(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  if (!bearerToken) {
    throw new UserNotAuthenticatedError('User not authorized');
  }
  const userId = await validateJWT(bearerToken);

  const params = validateDoByUUIDRequest(userId);
  const user = await getUserById(cfg.db, params);
  return respondWithJSON(200, validateUser(user));
}
