import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import type { User, CreateUserRequest } from "@task-manager/common";
import { validateCreateUserRequest, validateUser, validateUserArray } from "@task-manager/common";
import { createUser, getUsers } from "../../db/queries/users";
import { hashPassword } from "../../lib/auth/authentication";

export async function handlerGetUsers(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const users = await getUsers(cfg.db) as User[];
  // const result = users.filter(u => canUserAccessUser(user.capabilities, u));
  const result = users;
  return c.json(validateUserArray(result));
}

export async function handlerCreateUser(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  /* if (!canUserCreateUser(user.capabilities)) {
    throw new UserForbiddenError("User not authorized");
  } */
  const jsonBody = await c.req.json() as CreateUserRequest;
  const params: CreateUserRequest = validateCreateUserRequest({
    login: jsonBody.login,
    name: jsonBody.name,
    email: jsonBody.email,
    password: await hashPassword(jsonBody.password),
  });
  const result = await createUser(cfg.db, params) as User;
  return c.json(validateUser(result), 201);
}
