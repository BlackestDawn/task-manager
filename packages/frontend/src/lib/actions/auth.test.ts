import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@task-manager/common";
import {
  loginAction,
  logoutAction,
  getProfileAction,
  updateProfileAction,
  checkAuthAction,
} from "./auth";
import {
  setAuthCookies,
  clearAuthCookies,
  getAccessToken,
  serverGet,
  serverPut,
  serverPost,
} from "@/lib/utils/serverFetch";

vi.mock("@/lib/utils/serverFetch", () => ({
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
  getAccessToken: vi.fn(),
  serverGet: vi.fn(),
  serverPut: vi.fn(),
  serverPost: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "testuser",
    name: "Test User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(setAuthCookies).mockReset();
  vi.mocked(clearAuthCookies).mockReset();
  vi.mocked(getAccessToken).mockReset();
  vi.mocked(serverGet).mockReset();
  vi.mocked(serverPut).mockReset();
  vi.mocked(serverPost).mockReset();
});

describe("loginAction", () => {
  it("logs in and sets auth cookies on success", async () => {
    vi.mocked(serverPost).mockResolvedValue({
      user: makeUser(),
      tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
    });

    const result = await loginAction({ login: "testuser", password: "correctPassword123" });

    expect(result).toEqual({
      success: true,
      tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
    });
    expect(setAuthCookies).toHaveBeenCalledWith("access-1", "refresh-1");
  });

  it("returns a failure result when the API call rejects", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("invalid username or password"));

    const result = await loginAction({ login: "testuser", password: "wrongPassword" });

    expect(result).toEqual({ success: false, error: "invalid username or password" });
    expect(setAuthCookies).not.toHaveBeenCalled();
  });

  it("returns a failure result for invalid credentials shape without calling the API", async () => {
    const result = await loginAction({ login: "", password: "short" });

    expect(result.success).toBe(false);
    expect(serverPost).not.toHaveBeenCalled();
  });
});

describe("logoutAction", () => {
  it("clears auth cookies and reports success", async () => {
    vi.mocked(serverPost).mockResolvedValue(undefined);

    const result = await logoutAction();

    expect(result).toEqual({ success: true });
    expect(clearAuthCookies).toHaveBeenCalledTimes(1);
  });

  it("still clears cookies and reports success even if the API call fails", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("network error"));

    const result = await logoutAction();

    expect(result).toEqual({ success: true });
    expect(clearAuthCookies).toHaveBeenCalledTimes(1);
  });
});

describe("getProfileAction", () => {
  it("returns the user on success", async () => {
    vi.mocked(serverGet).mockResolvedValue(makeUser());

    const result = await getProfileAction();

    expect(result?.id).toBe(USER_ID);
  });

  it("returns null when the API call fails", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("unauthenticated"));

    const result = await getProfileAction();

    expect(result).toBeNull();
  });
});

describe("updateProfileAction", () => {
  it("updates the profile and revalidates on success", async () => {
    vi.mocked(serverPut).mockResolvedValue(makeUser({ name: "New Name" }));

    const result = await updateProfileAction({
      login: "testuser",
      name: "New Name",
      email: null,
      accessLevel: "user",
    });

    expect(result.user?.name).toBe("New Name");
  });

  it("returns an error result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("Failed to update user"));

    const result = await updateProfileAction({
      login: "testuser",
      name: "New Name",
      email: null,
      accessLevel: "user",
    });

    expect(result).toEqual({ error: "Failed to update user" });
  });
});

describe("checkAuthAction", () => {
  it("returns unauthenticated without calling the API when there's no access token", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null);

    const result = await checkAuthAction();

    expect(result).toEqual({ user: null, isAuthenticated: false });
    expect(serverGet).not.toHaveBeenCalled();
  });

  it("returns authenticated for an active user with a token", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("a-token");
    vi.mocked(serverGet).mockResolvedValue(makeUser({ disabled: false }));

    const result = await checkAuthAction();

    expect(result.isAuthenticated).toBe(true);
    expect(result.user?.id).toBe(USER_ID);
  });

  it("returns unauthenticated for a disabled user, even with a valid token", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("a-token");
    vi.mocked(serverGet).mockResolvedValue(makeUser({ disabled: true }));

    const result = await checkAuthAction();

    expect(result.isAuthenticated).toBe(false);
  });

  it("returns unauthenticated when the profile fetch fails", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("a-token");
    vi.mocked(serverGet).mockRejectedValue(new Error("network error"));

    const result = await checkAuthAction();

    expect(result).toEqual({ user: null, isAuthenticated: false });
  });
});
