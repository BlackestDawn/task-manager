import { eq, and, isNull, gt, sql } from "drizzle-orm";
import { type DBConn } from "../../config";
import { refresh_tokens, userGroups } from "../schema";
import type { RegisterRefreashToken, DoRefreashTokenByToken, DoByUUIDRequest } from "@task-manager/common";

export async function registerRefreashToken(db: DBConn, params: RegisterRefreashToken) {
  const [result] = await db.insert(refresh_tokens).values(params).returning();
  return result;
}

export async function getRefreshTokenByToken(db: DBConn, params: DoRefreashTokenByToken) {
  const [result] = await db.select().from(refresh_tokens).where(eq(refresh_tokens.token, params.token));
  return result;
}

export async function revokeRefreshToken(db: DBConn, params: DoRefreashTokenByToken) {
  const [result] = await db.update(refresh_tokens).set({
    revokedAt: new Date()
  }).where(eq(refresh_tokens.token, params.token)).returning();
  return result;
}

export async function getValidRefreshTokenByUserId(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(refresh_tokens)
    .where(and(
      eq(refresh_tokens.userId, params.id),
      isNull(refresh_tokens.revokedAt),
      gt(refresh_tokens.expiresAt, sql`now()`)
    ));
  return result;
}

export async function revokeAllRefreshTokensForUser(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.update(refresh_tokens).set({
    revokedAt: new Date()
  }).where(and(
    eq(refresh_tokens.userId, params.id),
    isNull(refresh_tokens.revokedAt)
  )).returning();
  return result;
}
