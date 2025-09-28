import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { User, UpdateUserRequest, DoByUUIDRequest } from "@task-manager/common";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError, AlreadyExistsConflictError } from "@task-manager/common";
import { validateUpdateUserRequest, validateUser } from "@task-manager/common";
import { updateUser, deleteUser, getUserById } from "../../db/queries/users";
import { hashPassword } from "@backend/src/lib/auth/authentication";

export async function handlerUpdateUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdateUserRequest;
  const params: UpdateUserRequest = validateUpdateUserRequest({
    ...jsonBody,
    id: idParam.id,
  });
  const existingUser = await getUserById(cfg.db, params);
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserModifyUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const updateParams = validateUpdateUserRequest({
    id: params.id,
    name: params.name || existingUser.name,
    email: params.email || existingUser.email,
    login: params.login || existingUser.login,
    password: params.password ? hashPassword(params.password) : existingUser.password,
    disabled: params.disabled !== null ? params.disabled : existingUser.disabled,
  }) as UpdateUserRequest;
  const result = await updateUser(cfg.db, updateParams) as User;
  return c.json(validateUser(result));
}

export async function handlerDeleteUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (existingUser) {
    /* if (!canUserDeleteUser(user.capabilities, existingUser)) {
      throw new UserForbiddenError("User not authorized");
    } */
    await deleteUser(cfg.db, idParam);
  }
  return c.body(null, 204);
}

export async function handlerGetUserById(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }
  /* if (!canUserAccessUser(user.capabilities, existingUser)) {
    throw new UserForbiddenError("User not authorized");
  } */
  return c.json(validateUser(existingUser));
}
