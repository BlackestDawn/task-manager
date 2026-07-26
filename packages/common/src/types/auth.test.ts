import { describe, it, expect } from "vitest";
import {
  validateLoginRequest,
  validateLoginResponse,
  validateRefreashToken,
  validateRegisterRefreashToken,
  validateRefreashTokenByToken,
  validateRefreshAccessTokenResponse,
  type LoginRequest,
  type LoginResponse,
  type RefreashToken,
  type RegisterRefreashToken,
  type DoRefreashTokenByToken,
  type RefreshAccessTokenResponse,
} from "./auth";
import { UserNotAuthenticatedError } from "../classes/errors";

describe("validateLoginRequest", () => {
  const validRequest: LoginRequest = {
    login: "testuser",
    password: "password123",
  };

  it("should validate a valid login request", () => {
    const result = validateLoginRequest(validRequest);
    expect(result.login).toBe(validRequest.login);
    expect(result.password).toBe(validRequest.password);
  });

  it("should throw UserNotAuthenticatedError for missing login", () => {
    const { login, ...requestWithoutLogin } = validRequest;
    expect(() => validateLoginRequest(requestWithoutLogin)).toThrow(
      UserNotAuthenticatedError
    );
    expect(() => validateLoginRequest(requestWithoutLogin)).toThrow(
      "invalid username or password"
    );
  });

  it("should throw UserNotAuthenticatedError for empty login", () => {
    const invalidRequest = { ...validRequest, login: "" };
    expect(() => validateLoginRequest(invalidRequest)).toThrow(
      UserNotAuthenticatedError
    );
  });

  it("should throw UserNotAuthenticatedError for missing password", () => {
    const { password, ...requestWithoutPassword } = validRequest;
    expect(() => validateLoginRequest(requestWithoutPassword)).toThrow(
      UserNotAuthenticatedError
    );
  });

  it("should throw UserNotAuthenticatedError for password less than 8 characters", () => {
    const invalidRequest = { ...validRequest, password: "short" };
    expect(() => validateLoginRequest(invalidRequest)).toThrow(
      UserNotAuthenticatedError
    );
  });

  it("should accept password with exactly 8 characters", () => {
    const requestWith8CharPassword = { ...validRequest, password: "12345678" };
    const result = validateLoginRequest(requestWith8CharPassword);
    expect(result.password).toBe("12345678");
  });

  it("should accept very long passwords", () => {
    const longPassword = "a".repeat(1000);
    const requestWithLongPassword = { ...validRequest, password: longPassword };
    const result = validateLoginRequest(requestWithLongPassword);
    expect(result.password).toBe(longPassword);
  });

  it("should accept passwords with special characters", () => {
    const specialPassword = "p@$$w0rd!#$%^&*()";
    const requestWithSpecialPassword = {
      ...validRequest,
      password: specialPassword,
    };
    const result = validateLoginRequest(requestWithSpecialPassword);
    expect(result.password).toBe(specialPassword);
  });

  it("should accept logins with special characters", () => {
    const specialLogin = "user.name+tag@example.com";
    const requestWithSpecialLogin = { ...validRequest, login: specialLogin };
    const result = validateLoginRequest(requestWithSpecialLogin);
    expect(result.login).toBe(specialLogin);
  });
});

describe("validateLoginResponse", () => {
  const validUser = {
    __typename: "User" as const,
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    login: "testuser",
    name: "Test User",
    email: "test@example.com",
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
  };

  const validTokens = {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    refreshToken: "refresh-token-string",
  };

  const validResponse: LoginResponse = {
    user: validUser,
    tokens: validTokens,
  };

  it("should validate a valid login response", () => {
    const result = validateLoginResponse(validResponse);
    expect(result.user).toBeDefined();
    expect(result.tokens).toBeDefined();
    expect(result.user.login).toBe(validUser.login);
    expect(result.tokens.accessToken).toBe(validTokens.accessToken);
  });

  it("should throw error for missing user", () => {
    const { user, ...responseWithoutUser } = validResponse;
    expect(() => validateLoginResponse(responseWithoutUser)).toThrow(
      "Invalid login response"
    );
  });

  it("should throw error for missing tokens", () => {
    const { tokens, ...responseWithoutTokens } = validResponse;
    expect(() => validateLoginResponse(responseWithoutTokens)).toThrow(
      "Invalid login response"
    );
  });

  it("should throw error for missing accessToken", () => {
    const responseWithoutAccessToken = {
      ...validResponse,
      tokens: { refreshToken: validTokens.refreshToken },
    };
    expect(() => validateLoginResponse(responseWithoutAccessToken)).toThrow(
      "Invalid login response"
    );
  });

  it("should throw error for missing refreshToken", () => {
    const responseWithoutRefreshToken = {
      ...validResponse,
      tokens: { accessToken: validTokens.accessToken },
    };
    expect(() => validateLoginResponse(responseWithoutRefreshToken)).toThrow(
      "Invalid login response"
    );
  });

  it("should throw error for invalid user object", () => {
    const responseWithInvalidUser = {
      ...validResponse,
      user: { ...validUser, id: "not-a-uuid" },
    };
    expect(() => validateLoginResponse(responseWithInvalidUser)).toThrow(
      "Invalid login response"
    );
  });

  it("should throw error for empty token strings", () => {
    const responseWithEmptyTokens = {
      ...validResponse,
      tokens: { accessToken: "", refreshToken: "" },
    };
    expect(() => validateLoginResponse(responseWithEmptyTokens)).toThrow(
      "Invalid login response"
    );
  });
});

describe("validateRefreashToken", () => {
  const validToken: RefreashToken = {
    token: "refresh-token-string-12345",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    userId: "123e4567-e89b-12d3-a456-426614174000",
    expiresAt: new Date("2024-12-31"),
    revokedAt: null,
  };

  it("should validate a valid refresh token", () => {
    const result = validateRefreashToken(validToken);
    expect(result.token).toBe(validToken.token);
    expect(result.userId).toBe(validToken.userId);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it("should handle null revokedAt", () => {
    const tokenWithNullRevoked = { ...validToken, revokedAt: null };
    const result = validateRefreashToken(tokenWithNullRevoked);
    expect(result.revokedAt).toBeNull();
  });

  it("should handle undefined revokedAt and default to null", () => {
    const { revokedAt, ...tokenWithoutRevoked } = validToken;
    const result = validateRefreashToken(tokenWithoutRevoked);
    expect(result.revokedAt).toBeNull();
  });

  it("should handle revoked token with revokedAt date", () => {
    const revokedToken = {
      ...validToken,
      revokedAt: new Date("2024-06-01"),
    };
    const result = validateRefreashToken(revokedToken);
    expect(result.revokedAt).toBeInstanceOf(Date);
  });

  it("should coerce string dates to Date objects", () => {
    const tokenWithStringDates = {
      ...validToken,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
      expiresAt: "2024-12-31T00:00:00Z",
      revokedAt: "2024-06-01T00:00:00Z",
    };
    const result = validateRefreashToken(tokenWithStringDates);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.revokedAt).toBeInstanceOf(Date);
  });

  it("should throw error for missing token string", () => {
    const { token, ...tokenWithoutString } = validToken;
    expect(() => validateRefreashToken(tokenWithoutString)).toThrow(
      "Invalid refresh token"
    );
  });

  it("should throw error for empty token string", () => {
    const invalidToken = { ...validToken, token: "" };
    expect(() => validateRefreashToken(invalidToken)).toThrow(
      "Invalid refresh token"
    );
  });

  it("should throw error for missing userId", () => {
    const { userId, ...tokenWithoutUserId } = validToken;
    expect(() => validateRefreashToken(tokenWithoutUserId)).toThrow(
      "Invalid refresh token"
    );
  });

  it("should throw error for invalid userId UUID", () => {
    const invalidToken = { ...validToken, userId: "not-a-uuid" };
    expect(() => validateRefreashToken(invalidToken)).toThrow(
      "Invalid refresh token"
    );
  });

  it("should throw error for missing expiresAt", () => {
    const { expiresAt, ...tokenWithoutExpiry } = validToken;
    expect(() => validateRefreashToken(tokenWithoutExpiry)).toThrow(
      "Invalid refresh token"
    );
  });

  it("should throw error for invalid date", () => {
    const invalidToken = { ...validToken, expiresAt: "not-a-date" };
    expect(() => validateRefreashToken(invalidToken)).toThrow(
      "Invalid refresh token"
    );
  });
});

describe("validateRegisterRefreashToken", () => {
  const validRequest: RegisterRefreashToken = {
    token: "new-refresh-token-12345",
    userId: "123e4567-e89b-12d3-a456-426614174000",
    expiresAt: new Date("2024-12-31"),
  };

  it("should validate a valid register refresh token request", () => {
    const result = validateRegisterRefreashToken(validRequest);
    expect(result.token).toBe(validRequest.token);
    expect(result.userId).toBe(validRequest.userId);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it("should coerce string date to Date object", () => {
    const requestWithStringDate = {
      ...validRequest,
      expiresAt: "2024-12-31T00:00:00Z",
    };
    const result = validateRegisterRefreashToken(requestWithStringDate);
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it("should throw error for missing token", () => {
    const { token, ...requestWithoutToken } = validRequest;
    expect(() => validateRegisterRefreashToken(requestWithoutToken)).toThrow(
      "Invalid register refresh token"
    );
  });

  it("should throw error for empty token", () => {
    const invalidRequest = { ...validRequest, token: "" };
    expect(() => validateRegisterRefreashToken(invalidRequest)).toThrow(
      "Invalid register refresh token"
    );
  });

  it("should throw error for missing userId", () => {
    const { userId, ...requestWithoutUserId } = validRequest;
    expect(() => validateRegisterRefreashToken(requestWithoutUserId)).toThrow(
      "Invalid register refresh token"
    );
  });

  it("should throw error for invalid userId UUID", () => {
    const invalidRequest = { ...validRequest, userId: "not-a-uuid" };
    expect(() => validateRegisterRefreashToken(invalidRequest)).toThrow(
      "Invalid register refresh token"
    );
  });

  it("should throw error for missing expiresAt", () => {
    const { expiresAt, ...requestWithoutExpiry } = validRequest;
    expect(() => validateRegisterRefreashToken(requestWithoutExpiry)).toThrow(
      "Invalid register refresh token"
    );
  });

  it("should throw error for invalid date", () => {
    const invalidRequest = { ...validRequest, expiresAt: "not-a-date" };
    expect(() => validateRegisterRefreashToken(invalidRequest)).toThrow(
      "Invalid register refresh token"
    );
  });

  it("should accept very long token strings", () => {
    const longToken = "a".repeat(1000);
    const requestWithLongToken = { ...validRequest, token: longToken };
    const result = validateRegisterRefreashToken(requestWithLongToken);
    expect(result.token).toBe(longToken);
  });

  it("should accept tokens with special characters", () => {
    const specialToken = "token-with_special.chars+123";
    const requestWithSpecialToken = { ...validRequest, token: specialToken };
    const result = validateRegisterRefreashToken(requestWithSpecialToken);
    expect(result.token).toBe(specialToken);
  });
});

describe("validateRefreashTokenByToken", () => {
  const validRequest: DoRefreashTokenByToken = {
    token: "some-refresh-token-12345",
  };

  it("should validate a valid request", () => {
    const result = validateRefreashTokenByToken(validRequest);
    expect(result.token).toBe(validRequest.token);
  });

  it("should throw error for missing token", () => {
    expect(() => validateRefreashTokenByToken({})).toThrow(
      "Invalid refresh token by token"
    );
  });

  it("should throw error for empty token", () => {
    expect(() =>
      validateRefreashTokenByToken({ token: "" })
    ).toThrow("Invalid refresh token by token");
  });

  it("should throw error for wrong data type", () => {
    expect(() => validateRefreashTokenByToken("not an object")).toThrow(
      "Invalid refresh token by token"
    );
    expect(() => validateRefreashTokenByToken(null)).toThrow(
      "Invalid refresh token by token"
    );
  });

  it("should ignore extra properties", () => {
    const requestWithExtra = { ...validRequest, extra: "field" };
    const result = validateRefreashTokenByToken(requestWithExtra);
    expect(result.token).toBe(validRequest.token);
    expect((result as any).extra).toBeUndefined();
  });
});

describe("validateRefreshAccessTokenResponse", () => {
  const validResponse: RefreshAccessTokenResponse = {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
  };

  it("should validate a valid response", () => {
    const result = validateRefreshAccessTokenResponse(validResponse);
    expect(result.accessToken).toBe(validResponse.accessToken);
  });

  it("should throw error for missing accessToken", () => {
    expect(() => validateRefreshAccessTokenResponse({})).toThrow(
      "Invalid refresh access token response"
    );
  });

  it("should throw error for empty accessToken", () => {
    expect(() =>
      validateRefreshAccessTokenResponse({ accessToken: "" })
    ).toThrow("Invalid refresh access token response");
  });

  it("should throw error for wrong data type", () => {
    expect(() => validateRefreshAccessTokenResponse("not an object")).toThrow(
      "Invalid refresh access token response"
    );
    expect(() => validateRefreshAccessTokenResponse(null)).toThrow(
      "Invalid refresh access token response"
    );
  });
});
