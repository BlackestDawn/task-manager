import type { ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { LoginRequest, LoginResponse, loggedinUser, User, UpdateUserRequest } from "@task-manager/common";
import { validateLoginRequest, validateLoginResponse, validateUpdateUserRequest } from "@task-manager/common";
import { UserNotAuthenticatedError, BadRequestError, UserForbiddenError } from "@task-manager/common";
import { getUserByLogin, updateUser } from "../../db/queries/users";
import { checkPasswordHash, makeJWT, makeRefreshToken, getAuthTokenFromHeaders } from "../../lib/auth/authentication";
import { getRefreshTokenByToken, revokeRefreshToken } from "../../db/queries/auth";
import { ForbiddenError } from "@casl/ability";

export async function handlerLoginUser(cfg: ApiConfig, req: BunRequest) {
  const params: LoginRequest = validateLoginRequest(await req.json() as LoginRequest);
  if (!params.login || !params.password) throw new UserNotAuthenticatedError("invalid username or password");

  const user = await getUserByLogin(cfg.db, params.login);
  if (!user || user.disabled || !checkPasswordHash(params.password, user.password)) {
    throw new UserNotAuthenticatedError("invalid username or password");
  }

  const token = await makeJWT(user.id);
  const refreshToken = await makeRefreshToken(user.id);
  const response: LoginResponse = validateLoginResponse({
    ...user,
    token: token,
    refreshToken: refreshToken.token,
  });

  return respondWithJSON(200, response);
}

export async function handlerRefreshAccessToken(cfg: ApiConfig, req: BunRequest) {
  const jsonBody = await req.json() as { token: string };
  const refreshToken = await getRefreshTokenByToken(cfg.db, jsonBody);

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

export async function handlerRevokeRefreshToken(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  console.log("incomming request body:", req.body);

  const jsonBody = await req.json() as { token: string };
  const refreshToken = await getRefreshTokenByToken(cfg.db, jsonBody);

  if (refreshToken?.userId !== user.userInfo.id) {
    throw new UserForbiddenError("Not allowed to revoke token");
  }
  const result = await revokeRefreshToken(cfg.db, jsonBody);

  if (!result) {
    throw new BadRequestError("Invalid refresh token");
  }

  return respondWithJSON(204, {});
}

export async function handlerGetSelf(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  return respondWithJSON(200, user.userInfo);
}

export async function handlerUpdateSelf(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const jsonBody = await req.json() as UpdateUserRequest;
  jsonBody.id = user.userInfo.id;

  const result = await updateUser(cfg.db, validateUpdateUserRequest(jsonBody))
  return respondWithJSON(200, result);
}
