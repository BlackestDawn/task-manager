import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash, getAuthTokenFromHeaders } from "./authentication";
import { UserForbiddenError, NotFoundError, BadRequestError, UserNotAuthenticatedError } from "@task-manager/common";
import jwt from "jsonwebtoken";
import { cfg } from "../../config";

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

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("makeJWT should create a token that can be validated", async () => {
    const token = await makeJWT(userID, expiresIn, secret);
    const validatedUserID = await validateJWT(token, secret);
    expect(validatedUserID).toBe(userID);
  });

  it("validateJWT should throw an error for an invalid signature", async () => {
    const token = await makeJWT(userID, expiresIn, secret);
    const wrongSecret = "this-is-the-wrong-secret";
    await expect(validateJWT(token, wrongSecret)).rejects.toThrow(new UserForbiddenError("Invalid token"));
  });

  it("validateJWT should throw an error for an expired token", async () => {
    const token = await makeJWT(userID, expiresIn, secret);

    // Fast-forward time to after the token has expired
    const oneHourAndOneSecondInMs = (expiresIn + 1) * 1000;
    vi.advanceTimersByTime(oneHourAndOneSecondInMs);

    await expect(validateJWT(token, secret)).rejects.toThrow(new UserForbiddenError("Invalid token"));
  });

  it("validateJWT should throw an error for a malformed token", async () => {
    const malformedToken = "this.is.not.a.valid.token";
    await expect(validateJWT(malformedToken, secret)).rejects.toThrow(new UserForbiddenError("Invalid token"));
  });

  it("validateJWT should throw an error for an invalid issuer", async () => {
    const tokenWithInvalidIssuer = jwt.sign({ iss: "wrong-issuer", sub: userID }, secret);
    await expect(validateJWT(tokenWithInvalidIssuer, secret)).rejects.toThrow(new UserForbiddenError("Invalid issuer"));
  });

  it("validateJWT should throw an error for a token with no subject", async () => {
    const tokenWithNoSub = jwt.sign({ iss: cfg.crypto.token_issuer }, secret);
    await expect(validateJWT(tokenWithNoSub, secret)).rejects.toThrow(new UserForbiddenError("No user ID in token"));
  });

  it("makeJWT should create a token with correct issuer and subject", async () => {
    const token = await makeJWT(userID, expiresIn, secret);
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    expect(decoded.iss).toBe(cfg.crypto.token_issuer);
    expect(decoded.sub).toBe(userID);
  });

  it("makeJWT should create a token with iat and exp claims", async () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const token = await makeJWT(userID, expiresIn, secret);
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    expect(decoded.iat).toBe(Math.floor(now / 1000));
    expect(decoded.exp).toBe(Math.floor(now / 1000) + expiresIn);
  });
});

describe("getAuthTokenFromHeaders", () => {
  it("should return the token from a valid Authorization header", async () => {
    const token = "my-secret-token";
    const headers =  new Headers({
      "Authorization": `Bearer ${token}`
    });

    const result = await getAuthTokenFromHeaders(headers);
    expect(result).toBe(token);
  });

  it("should throw an error if Authorization header is missing", async () => {
    const headers =  new Headers();

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Missing Authorization header");
  });

  it("should throw an error if the header is not a Bearer token", async () => {
    const headers =  new Headers({
      "Authorization": "Basic some-other-auth"
    });

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Malformed Authorization header");
  });

  it("should throw an error if the token is missing from the header", async () => {
    const headers =  new Headers({
      "Authorization": "Bearer "
    });

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Malformed Authorization header");
  });

  it("should throw an error for a malformed Authorization header", async () => {
    const headers =  new Headers({
      "Authorization": "Bearer"
    });

    await expect(getAuthTokenFromHeaders(headers)).rejects.toThrow("Malformed Authorization header");
  });
});
