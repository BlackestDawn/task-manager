import { describe, it, expect } from "vitest";
import { withTestTx } from "../testHelpers/testDb";
import { insertTestUser } from "../testHelpers/fixtures";
import {
  registerRefreashToken,
  getRefreshTokenByToken,
  revokeRefreshToken,
  getValidRefreshTokenByUserId,
} from "./auth";

describe("registerRefreashToken", () => {
  it("creates and returns a refresh token row", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const result = await registerRefreashToken(tx, {
        token: "a-token-value",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      });

      expect(result?.token).toBe("a-token-value");
      expect(result?.userId).toBe(user.id);
      expect(result?.revokedAt).toBeNull();
    });
  });
});

describe("getRefreshTokenByToken", () => {
  it("returns the matching row", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await registerRefreashToken(tx, {
        token: "find-me",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await getRefreshTokenByToken(tx, { token: "find-me" });
      expect(result?.userId).toBe(user.id);
    });
  });

  it("returns undefined for an unknown token", async () => {
    await withTestTx(async (tx) => {
      const result = await getRefreshTokenByToken(tx, { token: "does-not-exist" });
      expect(result).toBeUndefined();
    });
  });
});

describe("revokeRefreshToken", () => {
  it("sets revokedAt and returns the updated row", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await registerRefreashToken(tx, {
        token: "revoke-me",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await revokeRefreshToken(tx, { token: "revoke-me" });
      expect(result?.revokedAt).not.toBeNull();

      const fetched = await getRefreshTokenByToken(tx, { token: "revoke-me" });
      expect(fetched?.revokedAt).not.toBeNull();
    });
  });

  it("returns undefined for an unknown token", async () => {
    await withTestTx(async (tx) => {
      const result = await revokeRefreshToken(tx, { token: "does-not-exist" });
      expect(result).toBeUndefined();
    });
  });
});

describe("getValidRefreshTokenByUserId", () => {
  it("returns a token that is not revoked and not expired", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await registerRefreashToken(tx, {
        token: "valid-token",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const result = await getValidRefreshTokenByUserId(tx, { id: user.id });
      expect(result?.token).toBe("valid-token");
    });
  });

  it("does not return a revoked token", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await registerRefreashToken(tx, {
        token: "revoked-token",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      });
      await revokeRefreshToken(tx, { token: "revoked-token" });

      const result = await getValidRefreshTokenByUserId(tx, { id: user.id });
      expect(result).toBeUndefined();
    });
  });

  it("does not return an expired token", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await registerRefreashToken(tx, {
        token: "expired-token",
        userId: user.id,
        expiresAt: new Date(Date.now() - 60_000),
      });

      const result = await getValidRefreshTokenByUserId(tx, { id: user.id });
      expect(result).toBeUndefined();
    });
  });
});
