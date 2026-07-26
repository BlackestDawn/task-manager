import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash, getAuthTokenFromHeaders, makeRefreshToken } from "./authentication";
import { UserForbiddenError } from "@task-manager/common";
import jwt from "jsonwebtoken";
import { cfg } from "../../config";
import type { Context } from "hono";
import { registerRefreashToken } from "../../db/queries/auth";

vi.mock("../../db/queries/auth", () => ({
  registerRefreashToken: vi.fn(),
}));

describe("Password Hashing", () => {
  const password = "correctPassword123!";
  const wrongPassword = "anotherPassword456!";
  let hash: string;

  beforeAll(async () => {
    hash = await hashPassword(password);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password, hash);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash(wrongPassword, hash);
    expect(result).toBe(false);
  });

  it("should generate a different hash for the same password on subsequent calls", async () => {
    const newHash = await hashPassword(password);
    expect(newHash).not.toBe(hash);
    // But it should still validate correctly
    const result = await checkPasswordHash(password, newHash);
    expect(result).toBe(true);
  });
});

describe("JWT functions", () => {
  const userID = "test-user-id";
  const secret = "my-super-secret-key-for-testing";
  const expiresIn = 3600; // 1 hour

  describe("makeJWT", () => {
    it("should create a token that can be validated", async () => {
      const token = await makeJWT(userID, expiresIn, secret);
      const validatedUserID = await validateJWT(token, secret);
      expect(validatedUserID).toBe(userID);
    });

    it("should create a token with correct issuer and subject", async () => {
      const token = await makeJWT(userID, expiresIn, secret);
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      expect(decoded.iss).toBe(cfg.crypto.token_issuer);
      expect(decoded.sub).toBe(userID);
    });

    it("should create a token with iat and exp claims", async () => {
      const now = Date.now();
      const token = await makeJWT(userID, expiresIn, secret);
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const expectedIat = Math.floor(now / 1000);
      const expectedExp = expectedIat + expiresIn;

      // Allow for 1 second difference due to timing
      expect(decoded.iat).toBeGreaterThanOrEqual(expectedIat - 1);
      expect(decoded.iat).toBeLessThanOrEqual(expectedIat + 1);
      expect(decoded.exp).toBe(decoded.iat! + expiresIn);
    });

    it("should use default expiration time when not provided", async () => {
      const token = await makeJWT(userID);
      const decoded = jwt.verify(token, cfg.jwt.secret) as jwt.JwtPayload;
      const expectedExp = Math.floor(Date.now() / 1000) + cfg.jwt.defaultExpireTime;
      expect(decoded.exp).toBe(expectedExp);
    });

    it("should use default secret when not provided", async () => {
      const token = await makeJWT(userID, expiresIn);
      // Should be able to validate with default secret
      const validatedUserID = await validateJWT(token);
      expect(validatedUserID).toBe(userID);
    });

    it("should create different tokens for different users", async () => {
      const token1 = await makeJWT("user-1", expiresIn, secret);
      const token2 = await makeJWT("user-2", expiresIn, secret);
      expect(token1).not.toBe(token2);
    });

    it("should create tokens with custom expiration times", async () => {
      const shortExpiry = 60; // 1 minute
      const token = await makeJWT(userID, shortExpiry, secret);
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBe(now + shortExpiry);
    });

    it("should create valid JWT structure", async () => {
      const token = await makeJWT(userID, expiresIn, secret);
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it("should handle special characters in user ID", async () => {
      const specialUserId = "user-with-special-chars_123@domain.com";
      const token = await makeJWT(specialUserId, expiresIn, secret);
      const validatedUserID = await validateJWT(token, secret);
      expect(validatedUserID).toBe(specialUserId);
    });

    it("should create tokens with very short expiration", async () => {
      const veryShortExpiry = 1; // 1 second
      const token = await makeJWT(userID, veryShortExpiry, secret);
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBe(now + veryShortExpiry);
    });

    it("should create tokens with long expiration", async () => {
      const longExpiry = 86400 * 365; // 1 year
      const token = await makeJWT(userID, longExpiry, secret);
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.exp).toBe(now + longExpiry);
    });
  });

  describe("validateJWT", () => {
    it("should validate a valid token", async () => {
      const token = await makeJWT(userID, expiresIn, secret);
      const validatedUserID = await validateJWT(token, secret);
      expect(validatedUserID).toBe(userID);
    });

    it("should throw an error for an invalid signature", async () => {
      const token = await makeJWT(userID, expiresIn, secret);
      const wrongSecret = "this-is-the-wrong-secret";
      await expect(validateJWT(token, wrongSecret)).rejects.toThrow(
        new UserForbiddenError("Invalid token")
      );
    });

    it("should throw an error for an expired token", async () => {
      // Create a token that expires in 1 second
      const veryShortExpiry = 1;
      const token = await makeJWT(userID, veryShortExpiry, secret);

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      await expect(validateJWT(token, secret)).rejects.toThrow(
        new UserForbiddenError("Invalid token")
      );
    });

    it("should throw an error for a malformed token", async () => {
      const malformedToken = "this.is.not.a.valid.token";
      await expect(validateJWT(malformedToken, secret)).rejects.toThrow(
        new UserForbiddenError("Invalid token")
      );
    });

    it("should throw an error for an empty token", async () => {
      await expect(validateJWT("", secret)).rejects.toThrow(
        new UserForbiddenError("Invalid token")
      );
    });

    it("should throw an error for an invalid issuer", async () => {
      const tokenWithInvalidIssuer = jwt.sign(
        { iss: "wrong-issuer", sub: userID },
        secret
      );
      await expect(validateJWT(tokenWithInvalidIssuer, secret)).rejects.toThrow(
        new UserForbiddenError("Invalid issuer")
      );
    });

    it("should throw an error for a token with no subject", async () => {
      const tokenWithNoSub = jwt.sign({ iss: cfg.crypto.token_issuer }, secret);
      await expect(validateJWT(tokenWithNoSub, secret)).rejects.toThrow(
        new UserForbiddenError("No user ID in token")
      );
    });

    it("should throw an error for a token with empty subject", async () => {
      const tokenWithEmptySub = jwt.sign(
        { iss: cfg.crypto.token_issuer, sub: "" },
        secret
      );
      await expect(validateJWT(tokenWithEmptySub, secret)).rejects.toThrow(
        new UserForbiddenError("No user ID in token")
      );
    });

    it("should use default secret when not provided", async () => {
      const token = await makeJWT(userID, expiresIn);
      const validatedUserID = await validateJWT(token);
      expect(validatedUserID).toBe(userID);
    });

    it("should extract correct user ID from valid token", async () => {
      const userId1 = "user-id-123";
      const userId2 = "different-user-456";

      const token1 = await makeJWT(userId1, expiresIn, secret);
      const token2 = await makeJWT(userId2, expiresIn, secret);

      expect(await validateJWT(token1, secret)).toBe(userId1);
      expect(await validateJWT(token2, secret)).toBe(userId2);
    });

    it("should throw error for token with only two parts", async () => {
      const invalidToken = "header.payload";
      await expect(validateJWT(invalidToken, secret)).rejects.toThrow(
        new UserForbiddenError("Invalid token")
      );
    });

    it("should throw error for token with invalid base64 encoding", async () => {
      const invalidToken = "not.valid.base64!!!";
      await expect(validateJWT(invalidToken, secret)).rejects.toThrow(
        new UserForbiddenError("Invalid token")
      );
    });

    it("should throw error for token missing issuer", async () => {
      const tokenWithNoIssuer = jwt.sign({ sub: userID }, secret);
      await expect(validateJWT(tokenWithNoIssuer, secret)).rejects.toThrow(
        new UserForbiddenError("Invalid issuer")
      );
    });

    it("should validate token just before expiration", async () => {
      const shortExpiry = 2; // 2 seconds
      const token = await makeJWT(userID, shortExpiry, secret);

      // Wait 1 second (still valid)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const validatedUserID = await validateJWT(token, secret);
      expect(validatedUserID).toBe(userID);
    });
  });
});

describe("getAuthTokenFromHeaders", () => {
  const mockContext = (headers: Record<string, string>) => {
    return {
      req: {
        header: (key: string) => headers[key],
      },
    } as Context;
  };

  it("should return the token from a valid Authorization header", async () => {
    const token = "my-secret-token";
    const headers = mockContext({
      "Authorization": `Bearer ${token}`
    });

    const result = await getAuthTokenFromHeaders(headers);
    expect(result).toBe(token);
  });

  it("should throw an error if Authorization header is missing", async () => {
    const headers = mockContext({});

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Missing Authorization header");
  });

  it("should throw an error if the header is not a Bearer token", async () => {
    const headers = mockContext({
      "Authorization": "Basic some-other-auth"
    });

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Malformed Authorization header");
  });

  it("should throw an error if the token is missing from the header", async () => {
    const headers = mockContext({
      "Authorization": "Bearer "
    });

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Malformed Authorization header");
  });

  it("should throw an error for a malformed Authorization header", async () => {
    const headers = mockContext({
      "Authorization": "Bearer"
    });

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Malformed Authorization header");
  });
});

describe("makeRefreshToken", () => {
  const userId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    vi.mocked(registerRefreashToken).mockReset();
  });

  it("should return the created refresh token", async () => {
    const created = {
      token: "a-generated-token",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      revokedAt: null,
    };
    vi.mocked(registerRefreashToken).mockResolvedValueOnce(created);

    const result = await makeRefreshToken(userId);
    expect(result).toEqual(created);
  });

  it("should generate a random hex token and store it with the user ID", async () => {
    vi.mocked(registerRefreashToken).mockImplementationOnce(async (_db, params) => ({
      ...params,
      createdAt: new Date(),
      updatedAt: new Date(),
      revokedAt: null,
    }));

    await makeRefreshToken(userId);

    expect(registerRefreashToken).toHaveBeenCalledTimes(1);
    const [, params] = vi.mocked(registerRefreashToken).mock.calls[0]!;
    expect(params.userId).toBe(userId);
    expect(params.token).toMatch(/^[0-9a-f]{64}$/);
    expect(params.expiresAt).toBeInstanceOf(Date);
  });

  it("should generate a different token on each call", async () => {
    vi.mocked(registerRefreashToken).mockImplementation(async (_db, params) => ({
      ...params,
      createdAt: new Date(),
      updatedAt: new Date(),
      revokedAt: null,
    }));

    await makeRefreshToken(userId);
    await makeRefreshToken(userId);

    const calls = vi.mocked(registerRefreashToken).mock.calls;
    expect(calls[0]![1].token).not.toBe(calls[1]![1].token);
  });

  it("should throw when the database returns no result", async () => {
    vi.mocked(registerRefreashToken).mockResolvedValueOnce(undefined as any);

    await expect(makeRefreshToken(userId)).rejects.toThrow(
      "failed to create refresh token"
    );
  });
});
