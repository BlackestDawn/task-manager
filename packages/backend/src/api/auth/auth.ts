import type { ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { LoginRequest, LoginResponse } from "@task-manager/common";
import { validateLoginRequest, validateLoginResponse } from "@task-manager/common";
import { UserNotAuthenticatedError, BadRequestError } from "@task-manager/common";
import { getUserByLogin } from "../../db/queries/users";
import { checkPasswordHash, makeJWT, makeRefreshToken, getAuthTokenFromHeaders } from "../../lib/auth/authentication";
import { getRefreshTokenByToken, revokeRefreshToken, getValidRefreshTokenByUserId } from "../../db/queries/auth";

export async function handlerLoginUser(cfg: ApiConfig, req: BunRequest) {
  const params: LoginRequest = validateLoginRequest(await req.json() as LoginRequest);
  if (!params.login || !params.password) throw new UserNotAuthenticatedError("invalid username or password");

  const user = await getUserByLogin(cfg.db, params.login);
  if (!user) throw new UserNotAuthenticatedError("invalid username or password");
  if (user.disabled) throw new UserNotAuthenticatedError("invalid username or password");
  if (!checkPasswordHash(params.password, user.password)) throw new UserNotAuthenticatedError("invalid username or password");

  let refreshToken = await getValidRefreshTokenByUserId(cfg.db, { id: user.id });
  if (!refreshToken) {
    refreshToken = await makeRefreshToken(user.id);
  }

  const response: LoginResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    login: user.login,
    name: user.name,
    token: await makeJWT(user.id),
    refreshToken: refreshToken.token,
  };

  return respondWithJSON(200, validateLoginResponse(response));
}

export async function handlerRefreshAccessToken(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  const refreshToken = await getRefreshTokenByToken(cfg.db, { token: bearerToken });

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
  return respondWithJSON(200, { token: newToken });
}

export async function handlerRevokeRefreshToken(cfg: ApiConfig, req: BunRequest) {
  const bearerToken = await getAuthTokenFromHeaders(req.headers);
  const result = await revokeRefreshToken(cfg.db, {token: bearerToken});

  if (!result) {
    throw new BadRequestError("Invalid refresh token");
  }

  return respondWithJSON(204, {});
}
