import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import crypto from "crypto";
import { cfg } from "../../config";
import type { RegisterRefreashToken } from "@task-manager/common";
import { registerRefreashToken } from "../../db/queries/auth";
import { getTZNormalizedDate } from "@task-manager/common";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string) {
  return bcrypt.hashSync(password, cfg.crypto.salt_rounds);
}

export async function checkPasswordHash(password: string, hash: string) {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (err) {
    return false;
  }
}

export async function makeJWT(userID: string, expiresIn: number = cfg.jwt.defaultExpireTime, secret: string = cfg.jwt.secret) {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign({
    iss: cfg.crypto.token_issuer,
    sub: userID,
    iat: now,
    exp: now + expiresIn,
   } as payload,
   secret,
   { algorithm: "HS256" },
  );
}

export async function validateJWT(tokenString: string, secret: string = cfg.jwt.secret) {
  let token: JwtPayload;
  try {
    token = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (err) {
    throw new UserForbiddenError("Invalid token");
  }

  if (token.iss !== cfg.crypto.token_issuer) throw new UserForbiddenError("Invalid issuer");
  if (!token.sub) throw new UserForbiddenError("No user ID in token");

  return token.sub as string;
}

export async function getAuthTokenFromHeaders(headers: Headers, tokenType: string = "Bearer") {
  const authHeader = headers.get("Authorization");
  if (!authHeader) throw new UserNotAuthenticatedError("Missing Authorization header");
  const split = authHeader.split(" ");
  if (split.length < 2 || split[0] !== tokenType || !split[1]) throw new UserNotAuthenticatedError('Malformed Authorization header');
  return split[1];
}

export async function makeRefreshToken(userId: string) {
  const tokenString = crypto.randomBytes(32).toString("hex");
  const params: RegisterRefreashToken = {
    userId,
    token: tokenString,
    expiresAt: getTZNormalizedDate(cfg.refreashToken.defaultExpireTime),
  };
  const result = await registerRefreashToken(cfg.db, params);
  if (!result) {
    throw new Error("failed to create refresh token");
  }
  return result;
}
