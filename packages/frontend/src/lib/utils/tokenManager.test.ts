import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { tokenManager } from "./tokenManager";
import { API_BASE_URL } from "@/lib/data/consts";

function makeJwt(exp: number) {
  const header = btoa(JSON.stringify({ alg: "none" }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.signature`;
}

const NOW = Math.floor(Date.now() / 1000);
const VALID_TOKEN = makeJwt(NOW + 3600);
const EXPIRED_TOKEN = makeJwt(NOW - 10);

let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  tokenManager.clearTokens();
  fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("token storage", () => {
  it("stores and returns the access and refresh tokens", () => {
    tokenManager.setToken("access-1", "refresh-1");
    expect(tokenManager.getAccessToken()).toBe("access-1");
    expect(tokenManager.getRefreshToken()).toBe("refresh-1");
  });

  it("clears both tokens", () => {
    tokenManager.setToken("access-1", "refresh-1");
    tokenManager.clearTokens();
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("returns false for a token with plenty of time left", () => {
    expect(tokenManager.isTokenExpired(VALID_TOKEN)).toBe(false);
  });

  it("returns true for an expired token", () => {
    expect(tokenManager.isTokenExpired(EXPIRED_TOKEN)).toBe(true);
  });

  it("treats a malformed token as expired", () => {
    expect(tokenManager.isTokenExpired("not-a-jwt")).toBe(true);
  });
});

describe("refreshAccessToken", () => {
  it("returns null without fetching when there is no refresh token", async () => {
    const result = await tokenManager.refreshAccessToken();
    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches a new access token, keeps the refresh token, and dispatches token_refreshed", async () => {
    tokenManager.setToken("old-access", "refresh-1");
    fetchMock.mockImplementation((url: string) => {
      if (url === `${API_BASE_URL}/auth/refresh`) {
        return Promise.resolve(jsonResponse({ accessToken: "new-access" }));
      }
      return Promise.resolve(jsonResponse({}));
    });
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    const result = await tokenManager.refreshAccessToken();

    expect(result).toBe("new-access");
    expect(tokenManager.getAccessToken()).toBe("new-access");
    expect(tokenManager.getRefreshToken()).toBe("refresh-1");
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "token_refreshed" }));
  });

  it("returns null when the refresh endpoint responds with an error", async () => {
    tokenManager.setToken("old-access", "refresh-1");
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const result = await tokenManager.refreshAccessToken();

    expect(result).toBeNull();
    expect(tokenManager.getAccessToken()).toBe("old-access");
  });

  it("still returns the new token even if updating server cookies fails", async () => {
    tokenManager.setToken("old-access", "refresh-1");
    fetchMock.mockImplementation((url: string) => {
      if (url === `${API_BASE_URL}/auth/refresh`) {
        return Promise.resolve(jsonResponse({ accessToken: "new-access" }));
      }
      if (url === "/api/auth/update-cookies") {
        return Promise.reject(new Error("network error"));
      }
      return Promise.resolve(jsonResponse({}));
    });

    const result = await tokenManager.refreshAccessToken();

    expect(result).toBe("new-access");
  });

  it("dedupes concurrent calls into a single in-flight request", async () => {
    tokenManager.setToken("old-access", "refresh-1");
    let resolveRefresh!: (value: Response) => void;
    fetchMock.mockImplementation((url: string) => {
      if (url === `${API_BASE_URL}/auth/refresh`) {
        return new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        });
      }
      return Promise.resolve(jsonResponse({}));
    });

    const call1 = tokenManager.refreshAccessToken();
    const call2 = tokenManager.refreshAccessToken();

    resolveRefresh(jsonResponse({ accessToken: "new-access" }));
    const [result1, result2] = await Promise.all([call1, call2]);

    expect(result1).toBe("new-access");
    expect(result2).toBe("new-access");
    const refreshCalls = fetchMock.mock.calls.filter(([url]) => url === `${API_BASE_URL}/auth/refresh`);
    expect(refreshCalls).toHaveLength(1);
  });
});

describe("getValidTokens", () => {
  it("returns the in-memory token as-is when it isn't expired", async () => {
    tokenManager.setToken(VALID_TOKEN, "refresh-1");

    const result = await tokenManager.getValidTokens();

    expect(result).toBe(VALID_TOKEN);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches tokens from the server when there is no token in memory", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/auth/get-tokens") {
        return Promise.resolve(jsonResponse({ accessToken: VALID_TOKEN, refreshToken: "refresh-1" }));
      }
      return Promise.resolve(jsonResponse({}));
    });

    const result = await tokenManager.getValidTokens();

    expect(result).toBe(VALID_TOKEN);
    expect(tokenManager.getAccessToken()).toBe(VALID_TOKEN);
  });

  it("returns null when there is no token and the server has none either", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const result = await tokenManager.getValidTokens();

    expect(result).toBeNull();
  });

  it("refreshes an expired in-memory token", async () => {
    tokenManager.setToken(EXPIRED_TOKEN, "refresh-1");
    fetchMock.mockImplementation((url: string) => {
      if (url === `${API_BASE_URL}/auth/refresh`) {
        return Promise.resolve(jsonResponse({ accessToken: "refreshed-access" }));
      }
      return Promise.resolve(jsonResponse({}));
    });

    const result = await tokenManager.getValidTokens();

    expect(result).toBe("refreshed-access");
  });

  it("returns null when the in-memory token is expired and refreshing fails", async () => {
    tokenManager.setToken(EXPIRED_TOKEN, "refresh-1");
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const result = await tokenManager.getValidTokens();

    expect(result).toBeNull();
  });
});
