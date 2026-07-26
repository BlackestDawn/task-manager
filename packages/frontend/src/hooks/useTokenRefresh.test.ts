import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTokenRefresh } from "./useTokenRefresh";
import { tokenManager } from "@/lib/utils/tokenManager";

vi.mock("@/lib/utils/tokenManager", () => ({
  tokenManager: {
    setToken: vi.fn(),
    getAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    refreshAccessToken: vi.fn(),
  },
}));

let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

beforeEach(() => {
  vi.mocked(tokenManager.setToken).mockReset();
  vi.mocked(tokenManager.getAccessToken).mockReset();
  vi.mocked(tokenManager.isTokenExpired).mockReset();
  vi.mocked(tokenManager.refreshAccessToken).mockReset();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useTokenRefresh", () => {
  it("initializes tokens from the server on mount", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: "a", refreshToken: "r" }));

    renderHook(() => useTokenRefresh());

    await waitFor(() => {
      expect(tokenManager.setToken).toHaveBeenCalledWith("a", "r");
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/get-tokens", expect.objectContaining({ method: "GET" }));
  });

  it("does not set tokens when the server response is missing one", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: "a" }));

    renderHook(() => useTokenRefresh());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(tokenManager.setToken).not.toHaveBeenCalled();
  });

  it("does not set tokens when the initial fetch fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false));

    renderHook(() => useTokenRefresh());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(tokenManager.setToken).not.toHaveBeenCalled();
  });

  it("proactively refreshes an expired token on the periodic interval", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(jsonResponse({}));
    vi.mocked(tokenManager.getAccessToken).mockReturnValue("stale-token");
    vi.mocked(tokenManager.isTokenExpired).mockReturnValue(true);
    vi.mocked(tokenManager.refreshAccessToken).mockResolvedValue("new-token");

    renderHook(() => useTokenRefresh());
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

    expect(tokenManager.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("does not refresh on the interval when the token isn't expired", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(jsonResponse({}));
    vi.mocked(tokenManager.getAccessToken).mockReturnValue("valid-token");
    vi.mocked(tokenManager.isTokenExpired).mockReturnValue(false);

    renderHook(() => useTokenRefresh());
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

    expect(tokenManager.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("clears the interval on unmount so no refresh fires afterward", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(jsonResponse({}));
    vi.mocked(tokenManager.getAccessToken).mockReturnValue("stale-token");
    vi.mocked(tokenManager.isTokenExpired).mockReturnValue(true);
    vi.mocked(tokenManager.refreshAccessToken).mockResolvedValue("new-token");

    const { unmount } = renderHook(() => useTokenRefresh());
    unmount();
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);

    expect(tokenManager.refreshAccessToken).not.toHaveBeenCalled();
  });
});
