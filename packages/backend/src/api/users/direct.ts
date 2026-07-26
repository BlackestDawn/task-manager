import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { User, UpdateUserRequest, DoByUUIDRequest } from "@task-manager/common";
import { NotFoundError, UserForbiddenError } from "@task-manager/common";
import { validateUpdateUserRequest, validateUser } from "@task-manager/common";
import { updateUser, deleteUser, getUserById } from "../../db/queries/users";

export async function handlerUpdateUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const jsonBody = await c.req.json() as UpdateUserRequest;

  const existingUser = await getUserById(cfg.db, idParam) as User;
  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const abilities = c.get("capabilities");
  if (!abilities.canEditObject(existingUser)) throw new UserForbiddenError("User not authorized");

  // canEditObject is an object-level check and doesn't respect field
  // restrictions (e.g. the "login" forbid, or the self-update forbid on
  // "accessLevel"), so fields that carry their own restrictions need an
  // explicit per-field check whenever the request actually touches them.
  if ("login" in jsonBody && !abilities.canEditObjectField(existingUser, "login")) {
    throw new UserForbiddenError("User not authorized");
  }
  if ("accessLevel" in jsonBody) {
    if (!abilities.canEditObjectField(existingUser, "accessLevel")) {
      throw new UserForbiddenError("User not authorized");
    }
    const actor = c.get("user") as User;
    if (jsonBody.accessLevel === "admin" && actor.accessLevel !== "admin") {
      throw new UserForbiddenError("User not authorized");
    }
  }

  const updateParams = {
    id: idParam.id,
    data: validateUpdateUserRequest({
      login: jsonBody.login || existingUser.login,
      name: jsonBody.name || existingUser.name,
      email: jsonBody.email || existingUser.email,
      accessLevel: jsonBody.accessLevel || existingUser.accessLevel,
    }) as UpdateUserRequest,
  };
  const result = await updateUser(cfg.db, updateParams) as User;
  return c.json(validateUser(result));
}

export async function handlerDeleteUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const idParam = c.get("recID") as DoByUUIDRequest;
  const existingUser = await getUserById(cfg.db, idParam) as User;

  if (existingUser) {
    const abilities = c.get("capabilities");
    if (!abilities.canDeleteObject(existingUser)) throw new UserForbiddenError("User not authorized");

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

  const abilities = c.get("capabilities");
  if (!abilities.canViewObject(existingUser)) throw new UserForbiddenError("User not authorized");
  return c.json(validateUser(existingUser));
}
