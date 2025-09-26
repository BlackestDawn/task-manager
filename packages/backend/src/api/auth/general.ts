import type { ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { LoginRequest, LoginResponse, loggedinUser, User, UpdateUserRequest } from "@task-manager/common";
import { validateLoginRequest, validateLoginResponse, validateUpdateUserRequest } from "@task-manager/common";
import { UserNotAuthenticatedError, BadRequestError, UserForbiddenError } from "@task-manager/common";
import { getUserByLogin, updateUser } from "../../db/queries/users";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../../lib/auth/authentication";
import { getRefreshTokenByToken, revokeRefreshToken } from "../../db/queries/auth";

export async function handlerLoginUser(cfg: ApiConfig, req: BunRequest) {
  const params: LoginRequest = validateLoginRequest(await req.json() as LoginRequest);
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

  return respondWithJSON(200, response, req);
}

export async function handlerRefreshAccessToken(cfg: ApiConfig, req: BunRequest) {
  const jsonBody = await req.json() as { token: string };
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

  return respondWithJSON(200, { accessToken: newToken }, req);
}

export async function handlerRevokeRefreshToken(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as { token: string };
  const refreshTokenValue = jsonBody.token;

  if (!refreshTokenValue) {
    throw new UserNotAuthenticatedError("Missing refresh token");
  }

  const refreshToken = await getRefreshTokenByToken(cfg.db, { token: refreshTokenValue });

  if (refreshToken?.userId !== user.userInfo.id) {
    throw new UserForbiddenError("Not allowed to revoke token");
  }
  const result = await revokeRefreshToken(cfg.db, { token: refreshTokenValue });

  if (!result) {
    throw new BadRequestError("Invalid refresh token");
  }

  return respondWithJSON(204, {}, req);
}

export async function handlerGetSelf(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  return respondWithJSON(200, user.userInfo, req);
}

export async function handlerUpdateSelf(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as UpdateUserRequest;
  jsonBody.id = user.userInfo.id;

  const result = await updateUser(cfg.db, validateUpdateUserRequest(jsonBody))
  return respondWithJSON(200, result, req);
}
