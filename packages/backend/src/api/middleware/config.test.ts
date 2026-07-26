import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "hono";
import { addConfig, authMiddleware } from "./config";
import { cfg } from "../../config";
import { getUserById } from "../../db/queries/users";
import { getAuthTokenFromHeaders, validateJWT } from "../../lib/auth/authentication";

vi.mock("../../db/queries/users", () => ({
  getUserById: vi.fn(),
}));

vi.mock("../../lib/auth/authentication", () => ({
  getAuthTokenFromHeaders: vi.fn(),
  validateJWT: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeUserRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    login: "testuser",
    name: "Test User",
    email: "test@example.com",
    disabled: false,
    accessLevel: "user" as const,
    groups: [],
    ...overrides,
  };
}

function makeContext(get: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { config: cfg, ...get };
  const c = {
    get: (key: string) => store[key],
    set: (key: string, value: unknown) => {
      store[key] = value;
    },
  } as unknown as Context;
  return { c, store };
}

beforeEach(() => {
  vi.mocked(getUserById).mockReset();
  vi.mocked(getAuthTokenFromHeaders).mockReset();
  vi.mocked(validateJWT).mockReset();
});

describe("addConfig", () => {
  it("sets config in context and calls next", async () => {
    const { c, store } = makeContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await addConfig(c, next);

    expect(store.config).toBe(cfg);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("authMiddleware", () => {
  it("sets user and capabilities for a valid token and active user", async () => {
    vi.mocked(getAuthTokenFromHeaders).mockResolvedValue("a-jwt-token");
    vi.mocked(validateJWT).mockResolvedValue(USER_ID);
    vi.mocked(getUserById).mockResolvedValue(makeUserRow() as any);

    const { c, store } = makeContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await authMiddleware(c, next);

    expect((store.user as any).id).toBe(USER_ID);
    expect(store.capabilities).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("throws NotFoundError when the token references a user that no longer exists", async () => {
    vi.mocked(getAuthTokenFromHeaders).mockResolvedValue("a-jwt-token");
    vi.mocked(validateJWT).mockResolvedValue(USER_ID);
    vi.mocked(getUserById).mockResolvedValue(null);

    const { c } = makeContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await expect(authMiddleware(c, next)).rejects.toThrow("User not found");
    expect(next).not.toHaveBeenCalled();
  });

  it("throws UserForbiddenError for a disabled user", async () => {
    vi.mocked(getAuthTokenFromHeaders).mockResolvedValue("a-jwt-token");
    vi.mocked(validateJWT).mockResolvedValue(USER_ID);
    vi.mocked(getUserById).mockResolvedValue(makeUserRow({ disabled: true }) as any);

    const { c } = makeContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await expect(authMiddleware(c, next)).rejects.toThrow("User is disabled");
    expect(next).not.toHaveBeenCalled();
  });

  it("propagates errors from token extraction without calling next", async () => {
    vi.mocked(getAuthTokenFromHeaders).mockRejectedValue(new Error("Missing Authorization header"));

    const { c } = makeContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await expect(authMiddleware(c, next)).rejects.toThrow("Missing Authorization header");
    expect(next).not.toHaveBeenCalled();
    expect(getUserById).not.toHaveBeenCalled();
  });

  it("propagates errors from JWT validation without calling next", async () => {
    vi.mocked(getAuthTokenFromHeaders).mockResolvedValue("a-jwt-token");
    vi.mocked(validateJWT).mockRejectedValue(new Error("Invalid token"));

    const { c } = makeContext();
    const next = vi.fn().mockResolvedValue(undefined);

    await expect(authMiddleware(c, next)).rejects.toThrow("Invalid token");
    expect(next).not.toHaveBeenCalled();
    expect(getUserById).not.toHaveBeenCalled();
  });
});
