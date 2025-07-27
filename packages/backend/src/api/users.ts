import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, UpdateUserRequest, CreateUserRequest, UpdatePasswordRequest, disabledUserRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateCreateUserRequest, validateUpdateUserRequest, validateUpdatePasswordRequest, validateDoByUUIDRequest, validateUser, validateUserArray, validateTaskItemArray, validateDisabledUserRequest } from "@task-manager/common";
import { createUser, updateUser, deleteUser, getUsers, getUserById, getUserByLogin, updatePassword, getTasksForUser, getGroupsForUser, disabledUser } from "../db/queries/users";
import { hashPassword, getAndValidateUser } from "../lib/auth/authentication";

export async function handlerGetUsers(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const users = await getUsers(cfg.db);
  return respondWithJSON(200, validateUserArray(users));
}

export async function handlerCreateUser(cfg: ApiConfig, req: BunRequest) {
  const paramsRaw = await req.json() as CreateUserRequest;
  const params = validateCreateUserRequest(paramsRaw);
  const existingUser = await getUserByLogin(cfg.db, params.login);
  if (existingUser) {
    throw new AlreadyExistsConflictError("User already exists");
  }
  params.password = await hashPassword(params.password);
  const user = await createUser(cfg.db, params) as User;
  return respondWithJSON(201, validateUser(user));
}

export async function handlerUpdateUser(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = await req.json() as UpdateUserRequest;
  params.id = userId;
  const user = await updateUser(cfg.db, validateUpdateUserRequest(params));
  return respondWithJSON(200, validateUser(user));
}

export async function handlerUpdateUserPassword(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = await req.json() as UpdatePasswordRequest;
  params.id = userId;
  const user = await updatePassword(cfg.db, validateUpdatePasswordRequest(params));
  return respondWithJSON(200, validateUser(user));
}

export async function handlerDeleteUser(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = validateDoByUUIDRequest(userId);
  await deleteUser(cfg.db, params);
  return respondWithJSON(204, {});
}

export async function handlerGetUserById(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = validateDoByUUIDRequest(userId);
  const user = await getUserById(cfg.db, params);
  return respondWithJSON(200, validateUser(user));
}

export async function handlerGetTasksForUser(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = validateDoByUUIDRequest(userId);
  const tasks = await getTasksForUser(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerGetGroupsForUser(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = validateDoByUUIDRequest(userId);
  const tasks = await getGroupsForUser(cfg.db, params);
  return respondWithJSON(200, validateTaskItemArray(tasks));
}

export async function handlerDisabledUser(cfg: ApiConfig, req: BunRequest) {
  const userId = await getAndValidateUser(req.headers);
  const params = await req.json() as disabledUserRequest;
  params.id = userId;
  const user = await disabledUser(cfg.db, validateDisabledUserRequest(params));
  return respondWithJSON(200, validateUser(user));
}
