import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/data/consts";
import {
  serverGet,
  serverPost,
  serverPut,
  serverDelete,
  clearAuthCookies,
  setAuthCookies,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
} from "./serverFetch";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Matches Next's real redirect(): it throws rather than returning, so code
// after the call site never runs — a plain vi.fn() mock would silently let
// execution fall through and hide real bugs.
class MockNextRedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new MockNextRedirectError(url);
  }),
}));

function makeCookieStore(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    get: vi.fn((name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined)),
    set: vi.fn((name: string, value: string) => {
      store.set(name, value);
    }),
    delete: vi.fn((name: string) => {
      store.delete(name);
    }),
  };
}

// Builds a fake cookie store and wires it into the cookies() mock in one
// step, returning the store so tests can still assert on its get/set/delete
// spies. Keeps the single necessary type bypass here instead of repeating
// an `as any` at every call site.
function mockCookies(initial: Record<string, string> = {}) {
  const store = makeCookieStore(initial);
  vi.mocked(cookies).mockResolvedValue(store as unknown as Awaited<ReturnType<typeof cookies>>);
  return store;
}

// A JWT with the given `exp` claim (seconds since epoch). Signature is
// irrelevant here — serverFetch only ever decodes the payload locally.
function makeJwt(exp: number) {
  const header = btoa(JSON.stringify({ alg: "none" }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.signature`;
}

const NOW = Math.floor(Date.now() / 1000);
const VALID_TOKEN = makeJwt(NOW + 3600);
const EXPIRING_TOKEN = makeJwt(NOW + 30); // less than the 60s buffer
const REFRESH_TOKEN = "a-refresh-token";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(redirect).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

describe("getAccessToken / getRefreshToken / isAuthenticated", () => {
  it("returns null when there is no access token cookie", async () => {
    mockCookies();
    expect(await getAccessToken()).toBeNull();
  });

  it("returns the token as-is when it isn't close to expiring", async () => {
    mockCookies({ accessToken: VALID_TOKEN });
    expect(await getAccessToken()).toBe(VALID_TOKEN);
  });

  it("refreshes and returns a new token when the current one is about to expire", async () => {
    mockCookies({ accessToken: EXPIRING_TOKEN, refreshToken: REFRESH_TOKEN });
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: "brand-new-token" }));

    const result = await getAccessToken();

    expect(result).toBe("brand-new-token");
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/refresh`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("treats a malformed token as expired and attempts a refresh", async () => {
    mockCookies({ accessToken: "not-a-jwt", refreshToken: REFRESH_TOKEN });
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: "brand-new-token" }));

    expect(await getAccessToken()).toBe("brand-new-token");
  });

  it("returns null when the token is expiring and there's no refresh token", async () => {
    mockCookies({ accessToken: EXPIRING_TOKEN });
    expect(await getAccessToken()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("getRefreshToken returns null when unset", async () => {
    mockCookies();
    expect(await getRefreshToken()).toBeNull();
  });

  it("isAuthenticated reflects whether an access token is available", async () => {
    mockCookies({ accessToken: VALID_TOKEN });
    expect(await isAuthenticated()).toBe(true);

    mockCookies();
    expect(await isAuthenticated()).toBe(false);
  });
});

describe("setAuthCookies / clearAuthCookies", () => {
  it("sets both cookies as httpOnly with the expected max-ages", async () => {
    const store = mockCookies();

    await setAuthCookies("access-1", "refresh-1");

    expect(store.set).toHaveBeenCalledWith(
      "accessToken",
      "access-1",
      expect.objectContaining({ httpOnly: true, maxAge: 3600, path: "/" })
    );
    expect(store.set).toHaveBeenCalledWith(
      "refreshToken",
      "refresh-1",
      expect.objectContaining({ httpOnly: true, maxAge: 3600 * 24 * 60, path: "/" })
    );
  });

  it("deletes both cookies", async () => {
    const store = mockCookies({ accessToken: "x", refreshToken: "y" });

    await clearAuthCookies();

    expect(store.delete).toHaveBeenCalledWith("accessToken");
    expect(store.delete).toHaveBeenCalledWith("refreshToken");
  });
});

describe("serverGet / serverPost / serverPut / serverDelete — request construction", () => {
  beforeEach(() => {
    mockCookies({ accessToken: VALID_TOKEN });
  });

  it("builds an absolute URL from a relative endpoint and sends the bearer token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await serverGet("/tasks");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/tasks`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: `Bearer ${VALID_TOKEN}` }),
      })
    );
  });

  it("uses an absolute endpoint as-is instead of prefixing it", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await serverGet("https://other-host.example.com/thing");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://other-host.example.com/thing",
      expect.anything()
    );
  });

  it("serverPost sends a JSON body and the POST method", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }));

    await serverPost("/tasks", { title: "New" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/tasks`,
      expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "New" }) })
    );
  });

  it("serverPost with no data sends no body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await serverPost("/auth/logout");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/logout`,
      expect.objectContaining({ body: undefined })
    );
  });

  it("serverPut sends a JSON body and the PUT method", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }));

    await serverPut("/tasks/1", { title: "Updated" });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/tasks/1`,
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ title: "Updated" }) })
    );
  });

  it("serverDelete sends the DELETE method", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await serverDelete("/tasks/1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/tasks/1`,
      expect.objectContaining({ method: "DELETE" })
    );
  });
});

describe("response parsing", () => {
  beforeEach(() => {
    mockCookies({ accessToken: VALID_TOKEN });
  });

  it("returns null for a 204 No Content response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(await serverGet("/tasks/1")).toBeNull();
  });

  it("returns null when content-length is 0", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 200, headers: { "content-length": "0", "content-type": "application/json" } })
    );
    expect(await serverGet("/tasks/1")).toBeNull();
  });

  it("returns null when there's no content-type header", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 200 }));
    expect(await serverGet("/tasks/1")).toBeNull();
  });

  it("parses a JSON body when content-type indicates JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1", title: "A task" }));
    expect(await serverGet("/tasks/1")).toEqual({ id: "1", title: "A task" });
  });

  it("returns null for a non-JSON content-type", async () => {
    fetchMock.mockResolvedValue(
      new Response("plain text", { status: 200, headers: { "content-type": "text/plain" } })
    );
    expect(await serverGet("/tasks/1")).toBeNull();
  });
});

describe("error responses (non-401)", () => {
  beforeEach(() => {
    mockCookies({ accessToken: VALID_TOKEN });
  });

  it("throws using the API's error message", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Task not found" }, { status: 404 }));
    await expect(serverGet("/tasks/missing")).rejects.toThrow("Task not found");
  });

  it("falls back to a generic message when the error body isn't valid JSON", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 500 }));
    await expect(serverGet("/tasks/1")).rejects.toThrow("Request failed: 500");
  });
});

describe("401 handling and token refresh", () => {
  it("does not attempt a refresh when skipAuth is set, and just throws", async () => {
    mockCookies({ accessToken: VALID_TOKEN });
    fetchMock.mockResolvedValue(jsonResponse({ error: "unauthorized" }, { status: 401 }));

    await expect(serverGet("/tasks", { skipAuth: true })).rejects.toThrow("unauthorized");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not attempt a refresh when skipRefresh is set, and just throws", async () => {
    mockCookies({ accessToken: VALID_TOKEN });
    fetchMock.mockResolvedValue(jsonResponse({ error: "unauthorized" }, { status: 401 }));

    await expect(serverGet("/tasks", { skipRefresh: true })).rejects.toThrow("unauthorized");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes the token and retries the request on a 401", async () => {
    mockCookies({ accessToken: VALID_TOKEN, refreshToken: REFRESH_TOKEN });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "unauthorized" }, { status: 401 })) // original request
      .mockResolvedValueOnce(jsonResponse({ accessToken: "refreshed-token" })) // refresh call
      .mockResolvedValueOnce(jsonResponse({ id: "1", title: "A task" })); // retried request

    const result = await serverGet("/tasks/1");

    expect(result).toEqual({ id: "1", title: "A task" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // The retried request must use the freshly refreshed token, not the old one.
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${API_BASE_URL}/tasks/1`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer refreshed-token" }) })
    );
  });

  it("redirects to /login when there's no refresh token to use", async () => {
    mockCookies({ accessToken: VALID_TOKEN });
    fetchMock.mockResolvedValue(jsonResponse({ error: "unauthorized" }, { status: 401 }));

    await expect(serverGet("/tasks")).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login when the refresh call itself fails", async () => {
    mockCookies({ accessToken: VALID_TOKEN, refreshToken: REFRESH_TOKEN });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "unauthorized" }, { status: 401 })) // original request
      .mockResolvedValueOnce(new Response(null, { status: 401 })); // refresh call itself fails

    await expect(serverGet("/tasks")).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login when the retried request also fails", async () => {
    mockCookies({ accessToken: VALID_TOKEN, refreshToken: REFRESH_TOKEN });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "unauthorized" }, { status: 401 })) // original request
      .mockResolvedValueOnce(jsonResponse({ accessToken: "refreshed-token" })) // refresh succeeds
      .mockResolvedValueOnce(jsonResponse({ error: "still unauthorized" }, { status: 401 })); // retry fails too

    await expect(serverGet("/tasks")).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
