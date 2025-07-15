import { type ApiConfig } from "../config";
import { respondWithJSON } from "../lib/utils/response";
import type { BunRequest } from "bun";
import type { User, UpdateUserRequest, CreateUserRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import { validateCreateUserRequest, validateUpdateUserRequest } from "@task-manager/common";
import { createUser, updateUser, deleteUser, getUsers, getUserById } from "../db/queries/users";
import { validate as validateUUID } from "uuid";


export async function handlerGetUsers(cfg: ApiConfig, _: BunRequest) {
  const users = await getUsers(cfg.db);
  return respondWithJSON(200, users);
}

export async function handlerCreateUser(cfg: ApiConfig, req: BunRequest) {
  const params = await req.json() as CreateUserRequest;
  const user = await createUser(cfg.db, validateCreateUserRequest(params));
  return respondWithJSON(201, user);
}

export async function handlerUpdateUser(cfg: ApiConfig, req: BunRequest) {
  const { userId } = req.params as { userId: string };
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }
  const params = await req.json() as UpdateUserRequest;
  params.id = userId;
  const user = await updateUser(cfg.db, validateUpdateUserRequest(params));
  return respondWithJSON(200, user);
}

export async function handlerDeleteUser(cfg: ApiConfig, req: BunRequest) {
  const { userId } = req.params as { userId: string };
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }
  await deleteUser(cfg.db, userId);
  return respondWithJSON(204, {});
}

export async function handlerGetUserById(cfg: ApiConfig, req: BunRequest) {
  const { userId } = req.params as { userId: string };
  if (!validateUUID(userId)) {
    throw new BadRequestError("Invalid/malformed user ID");
  }
  const user = await getUserById(cfg.db, userId);
  return respondWithJSON(200, user);
}
