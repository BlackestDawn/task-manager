import type { ApiConfig } from "../../config";
import { respondWithJSON } from "../../lib/utils/response";
import type { BunRequest } from "bun";
import type { LoginRequest, LoginResponse, loggedinUser, User, UpdateUserRequest } from "@task-manager/common";
import { validateLoginRequest, validateLoginResponse, validateUpdateUserRequest } from "@task-manager/common";
import { UserNotAuthenticatedError, BadRequestError, UserForbiddenError } from "@task-manager/common";
import { getUserByLogin, updateUser } from "../../db/queries/users";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../../lib/auth/authentication";
import { getRefreshTokenByToken, revokeRefreshToken } from "../../db/queries/auth";
import { clearCookie, getCookie, isWebClient, setCookie } from "@backend/src/lib/utils/cookies";
import { getSimpleCORSHeaders } from "../middleware/cors";

export async function handlerLoginUser(cfg: ApiConfig, req: BunRequest) {
  const params: LoginRequest = validateLoginRequest(await req.json() as LoginRequest);
  if (!params.login || !params.password) throw new UserNotAuthenticatedError("invalid username or password");

  const user = await getUserByLogin(cfg.db, params.login);
  if (!user || user.disabled || !checkPasswordHash(params.password, user.password)) {
    throw new UserNotAuthenticatedError("invalid username or password");
  }

  const tokens = {
    accesstoken: await makeJWT(user.id),
    refreshToken: (await makeRefreshToken(user.id)).token,
  };
  const isWeb = isWebClient(req);

  const response: LoginResponse = validateLoginResponse({
    user,
    tokens: isWeb ? null : tokens,
    cookieSet: isWeb,
  });

  if (isWeb) {
    const jsonResponse = new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getSimpleCORSHeaders(req),
      },
    });

    setCookie(jsonResponse, "accessToken", tokens.accesstoken, {
      "Max-Age": cfg.jwt.defaultExpireTime,
    });

    setCookie(jsonResponse, "refreshToken", tokens.refreshToken, {
      "Max-Age": cfg.refreashToken.defaultExpireTime,
    });

    return jsonResponse;
  } else {
    return respondWithJSON(200, response);
  }
}

export async function handlerRefreshAccessToken(cfg: ApiConfig, req: BunRequest) {
  const isWeb = isWebClient(req);
  let refreshTokenValue: string | null;

  if (isWeb) {
    refreshTokenValue = getCookie(req, "refreshToken");
  } else {
    const jsonBody = await req.json() as { token: string };
    refreshTokenValue = jsonBody.token;
  }
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

  if (isWeb) {
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getSimpleCORSHeaders(req),
      },
    });

    setCookie(response, "accessToken", newToken, {
      "Max-Age": cfg.jwt.defaultExpireTime,
    });

    return response;
  } else {
    return respondWithJSON(200, { token: newToken });
  }
}

export async function handlerRevokeRefreshToken(cfg: ApiConfig, req: BunRequest, user: loggedinUser) {
  const isWeb = isWebClient(req);
  let refreshTokenValue: string | null;

  if (isWeb) {
    refreshTokenValue = getCookie(req, "refreshToken");
  } else {
    const jsonBody = await req.json() as { token: string };
    refreshTokenValue = jsonBody.token;
  }
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

  if (isWeb) {
    const response = new Response(null, {
      status: 204,
      headers: getSimpleCORSHeaders(req),
    });
    clearCookie(response, "accessToken");
    clearCookie(response, "refreshToken");
    return response;
  } else {
    return respondWithJSON(204, {});
  }
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
