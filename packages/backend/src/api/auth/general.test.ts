import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "hono";
import type { User } from "@task-manager/common";
import {
  handlerLoginUser,
  handlerRefreshAccessToken,
  handlerRevokeRefreshToken,
  handlerGetSelf,
  handlerUpdateSelf,
} from "./general";
import { getUserByLogin, updateUser } from "../../db/queries/users";
import { getRefreshTokenByToken, revokeRefreshToken } from "../../db/queries/auth";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "../../lib/auth/authentication";

vi.mock("../../db/queries/users", () => ({
  getUserByLogin: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("../../db/queries/auth", () => ({
  getRefreshTokenByToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
}));

vi.mock("../../lib/auth/authentication", () => ({
  checkPasswordHash: vi.fn(),
  makeJWT: vi.fn(),
  makeRefreshToken: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";

function makeUserRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    login: "testuser",
    name: "Test User",
    password: "hashed-password",
    email: "test@example.com",
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
    ...overrides,
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    login: "testuser",
    name: "Test User",
    email: "test@example.com",
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

function makeContext(opts: {
  get?: Record<string, unknown>;
  jsonBody?: unknown;
} = {}): Context {
  const store: Record<string, unknown> = { config: { db: {} }, ...opts.get };
  return {
    get: (key: string) => store[key],
    set: (key: string, value: unknown) => {
      store[key] = value;
    },
    req: {
      json: async () => opts.jsonBody,
    },
    json: (data: unknown, status?: number) => ({ __kind: "json", data, status: status ?? 200 }),
    body: (data: unknown, status?: number) => ({ __kind: "body", data, status }),
  } as unknown as Context;
}

beforeEach(() => {
  vi.mocked(getUserByLogin).mockReset();
  vi.mocked(updateUser).mockReset();
  vi.mocked(getRefreshTokenByToken).mockReset();
  vi.mocked(revokeRefreshToken).mockReset();
  vi.mocked(checkPasswordHash).mockReset();
  vi.mocked(makeJWT).mockReset();
  vi.mocked(makeRefreshToken).mockReset();
});

describe("handlerLoginUser", () => {
  it("should return user and tokens on successful login", async () => {
    vi.mocked(getUserByLogin).mockResolvedValue(makeUserRow() as any);
    vi.mocked(checkPasswordHash).mockResolvedValue(true);
    vi.mocked(makeJWT).mockResolvedValue("access-token-value");
    vi.mocked(makeRefreshToken).mockResolvedValue({ token: "refresh-token-value" } as any);

    const c = makeContext({ jsonBody: { login: "testuser", password: "correctPassword123" } });
    const result = await handlerLoginUser(c) as any;

    expect(result.data.tokens.accessToken).toBe("access-token-value");
    expect(result.data.tokens.refreshToken).toBe("refresh-token-value");
    expect(result.data.user.login).toBe("testuser");
  });

  it("should reject when the user does not exist", async () => {
    vi.mocked(getUserByLogin).mockResolvedValue(null);

    const c = makeContext({ jsonBody: { login: "nobody", password: "somePassword123" } });
    await expect(handlerLoginUser(c)).rejects.toThrow("invalid username or password");
  });

  it("should reject a disabled user", async () => {
    vi.mocked(getUserByLogin).mockResolvedValue(makeUserRow({ disabled: true }) as any);

    const c = makeContext({ jsonBody: { login: "testuser", password: "correctPassword123" } });
    await expect(handlerLoginUser(c)).rejects.toThrow("invalid username or password");
  });

  it("should reject an incorrect password", async () => {
    vi.mocked(getUserByLogin).mockResolvedValue(makeUserRow() as any);
    vi.mocked(checkPasswordHash).mockResolvedValue(false);

    const c = makeContext({ jsonBody: { login: "testuser", password: "wrongPassword123" } });
    await expect(handlerLoginUser(c)).rejects.toThrow("invalid username or password");

    // Regression guard: checkPasswordHash must actually be awaited and its
    // result respected, not just invoked and ignored.
    expect(checkPasswordHash).toHaveBeenCalledWith("wrongPassword123", "hashed-password");
  });

  it("should reject a request missing login or password", async () => {
    const c = makeContext({ jsonBody: { login: "", password: "" } });
    await expect(handlerLoginUser(c)).rejects.toThrow("invalid username or password");
    expect(getUserByLogin).not.toHaveBeenCalled();
  });
});

describe("handlerRefreshAccessToken", () => {
  it("should return a new access token for a valid refresh token", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "valid-refresh-token",
      userId: USER_ID,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    } as any);
    vi.mocked(makeJWT).mockResolvedValue("new-access-token");

    const c = makeContext({ jsonBody: { token: "valid-refresh-token" } });
    const result = await handlerRefreshAccessToken(c) as any;

    expect(result.data.accessToken).toBe("new-access-token");
    expect(makeJWT).toHaveBeenCalledWith(USER_ID);
  });

  it("should reject when the token is missing from the request body", async () => {
    const c = makeContext({ jsonBody: {} });
    await expect(handlerRefreshAccessToken(c)).rejects.toThrow("Missing refresh token");
  });

  it("should reject when the token does not exist", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue(undefined as any);

    const c = makeContext({ jsonBody: { token: "unknown-token" } });
    await expect(handlerRefreshAccessToken(c)).rejects.toThrow("Invalid refresh token");
  });

  it("should reject a revoked token", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "revoked-token",
      userId: USER_ID,
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    } as any);

    const c = makeContext({ jsonBody: { token: "revoked-token" } });
    await expect(handlerRefreshAccessToken(c)).rejects.toThrow("Refresh token has been revoked");
  });

  it("should reject an expired token", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "expired-token",
      userId: USER_ID,
      revokedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
    } as any);

    const c = makeContext({ jsonBody: { token: "expired-token" } });
    await expect(handlerRefreshAccessToken(c)).rejects.toThrow("Refresh token has expired");
  });
});

describe("handlerRevokeRefreshToken", () => {
  it("should allow a user to revoke their own token", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "own-token",
      userId: USER_ID,
    } as any);
    vi.mocked(revokeRefreshToken).mockResolvedValue({ token: "own-token" } as any);

    const c = makeContext({
      get: { user: makeUser({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { token: "own-token" },
    });
    const result = await handlerRevokeRefreshToken(c) as any;

    expect(result.status).toBe(204);
  });

  it("should allow an admin to revoke another user's token", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "someone-elses-token",
      userId: OTHER_USER_ID,
    } as any);
    vi.mocked(revokeRefreshToken).mockResolvedValue({ token: "someone-elses-token" } as any);

    const c = makeContext({
      get: { user: makeUser({ id: USER_ID, accessLevel: "admin" }) },
      jsonBody: { token: "someone-elses-token" },
    });
    const result = await handlerRevokeRefreshToken(c) as any;

    expect(result.status).toBe(204);
  });

  it("should reject a non-admin revoking another user's token", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "someone-elses-token",
      userId: OTHER_USER_ID,
    } as any);

    const c = makeContext({
      get: { user: makeUser({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { token: "someone-elses-token" },
    });
    await expect(handlerRevokeRefreshToken(c)).rejects.toThrow("Not allowed to revoke token");
    expect(revokeRefreshToken).not.toHaveBeenCalled();
  });

  it("should reject when the token is missing from the request body", async () => {
    const c = makeContext({
      get: { user: makeUser({ id: USER_ID }) },
      jsonBody: {},
    });
    await expect(handlerRevokeRefreshToken(c)).rejects.toThrow("Missing refresh token");
  });

  it("should throw BadRequestError when the revoke itself fails", async () => {
    vi.mocked(getRefreshTokenByToken).mockResolvedValue({
      token: "own-token",
      userId: USER_ID,
    } as any);
    vi.mocked(revokeRefreshToken).mockResolvedValue(undefined as any);

    const c = makeContext({
      get: { user: makeUser({ id: USER_ID, accessLevel: "user" }) },
      jsonBody: { token: "own-token" },
    });
    await expect(handlerRevokeRefreshToken(c)).rejects.toThrow("Invalid refresh token");
  });
});

describe("handlerGetSelf", () => {
  it("should return the user from context", async () => {
    const user = makeUser();
    const c = makeContext({ get: { user } });
    const result = await handlerGetSelf(c) as any;

    expect(result.data).toEqual(user);
    expect(result.status).toBe(200);
  });
});

describe("handlerUpdateSelf", () => {
  const updateBody = {
    login: "testuser",
    name: "Updated Name",
    email: "updated@example.com",
    accessLevel: "user" as const,
  };

  it("should update and return the user", async () => {
    const updated = makeUserRow({ name: "Updated Name" });
    vi.mocked(updateUser).mockResolvedValue(updated as any);

    const c = makeContext({
      get: { user: makeUser() },
      jsonBody: updateBody,
    });
    const result = await handlerUpdateSelf(c) as any;

    expect(result.data.name).toBe("Updated Name");
    expect(updateUser).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: USER_ID })
    );
  });

  it("should throw BadRequestError when the update fails", async () => {
    vi.mocked(updateUser).mockResolvedValue(null as any);

    const c = makeContext({
      get: { user: makeUser() },
      jsonBody: updateBody,
    });
    await expect(handlerUpdateSelf(c)).rejects.toThrow("Failed to update user");
  });
});
