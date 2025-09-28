import type { Context } from "hono";
import type { ApiConfig } from "../../config";
import type { LoginRequest, LoginResponse, UpdateUserRequest, User } from "@task-manager/common";
import { validateLoginRequest, validateLoginResponse, validateUpdateUserRequest } from "@task-manager/common";
import { UserNotAuthenticatedError, BadRequestError, UserForbiddenError } from "@task-manager/common";
import { getUserByLogin, updateUser } from "../../db/queries/users";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../../lib/auth/authentication";
import { getRefreshTokenByToken, revokeRefreshToken } from "../../db/queries/auth";

export async function handlerLoginUser(c: Context) {
  const cfg = c.get("config");

  const params: LoginRequest = validateLoginRequest(await c.req.json() as LoginRequest);
  if (!params.login || !params.password) throw new UserNotAuthenticatedError("invalid username or password");

  const user = await getUserByLogin(cfg.db, params.login);
  if (!user || user.disabled || !checkPasswordHash(params.password, user.password)) {
    throw new UserNotAuthenticatedError("invalid username or password");
  }

  const tokens = {
    accessToken: await makeJWT(user.id),
    refreshToken: (await makeRefreshToken(user.id)).token,
  };

  const response: LoginResponse = validateLoginResponse({
    user,
    tokens,
  });

  return c.json(response);
}

export async function handlerRefreshAccessToken(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const jsonBody = await c.req.json() as { token: string };
  const refreshTokenValue = jsonBody.token;

  if (!refreshTokenValue) {
    throw new UserNotAuthenticatedError("Missing refresh token");
  }

  const refreshToken = await getRefreshTokenByToken(cfg.db, { token: refreshTokenValue });

  if (!refreshToken) {
    throw new UserNotAuthenticatedError("Invalid refresh token");
  }

  if (refreshToken.revokedAt) {
    throw new UserNotAuthenticatedError("Refresh token has been revoked");
  }

  if (refreshToken.expiresAt < new Date()) {
    throw new UserNotAuthenticatedError("Refresh token has expired");
  }

  const newToken = await makeJWT(refreshToken.userId);

  return c.json({ accessToken: newToken });
}

export async function handlerRevokeRefreshToken(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  const jsonBody = await c.req.json() as { token: string };
  const refreshTokenValue = jsonBody.token;

  if (!refreshTokenValue) {
    throw new UserNotAuthenticatedError("Missing refresh token");
  }

  const refreshToken = await getRefreshTokenByToken(cfg.db, { token: refreshTokenValue });

  if (refreshToken?.userId !== user.id || user.accessLevel !== "admin") {
    throw new UserForbiddenError("Not allowed to revoke token");
  }
  const result = await revokeRefreshToken(cfg.db, { token: refreshTokenValue });

  if (!result) {
    throw new BadRequestError("Invalid refresh token");
  }

  return c.body(null, 204);
}

export async function handlerGetSelf(c: Context) {
  const user = c.get("user") as User;

  return c.json(user, 200);
}

export async function handlerUpdateSelf(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  const user = c.get("user") as User;
  const body = await c.req.json();
  const updateData: UpdateUserRequest = validateUpdateUserRequest({
    id: user.id,
    ...body
  });

  const updatedUser = await updateUser(cfg.db, updateData);

  if (!updatedUser) throw new BadRequestError("Failed to update user");

  return c.json(updatedUser, 200);
}
