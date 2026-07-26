import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { User } from "@task-manager/common";
import { ClientAuthProvider, useAuthContext } from "./clientAuthProvider";
import { checkAuthAction } from "@/lib/actions/auth";

vi.mock("@/lib/actions/auth", () => ({
  checkAuthAction: vi.fn(),
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "current",
    name: "Current User",
    email: null,
    disabled: false,
    accessLevel: "admin",
    groups: [],
    ...overrides,
  };
}

function Consumer() {
  const { user, isAuthenticated, ability, refreshAuth } = useAuthContext();
  return (
    <div>
      <p>user: {user ? user.name : "null"}</p>
      <p>isAuthenticated: {String(isAuthenticated)}</p>
      <p>canManageAll: {String(ability.can("manage", "all"))}</p>
      <button onClick={() => refreshAuth()}>refresh</button>
    </div>
  );
}

beforeEach(() => {
  vi.mocked(checkAuthAction).mockReset().mockResolvedValue({ user: null, isAuthenticated: false });
  delete window.__INITIAL_AUTH_STATE__;
});

afterEach(() => {
  delete window.__INITIAL_AUTH_STATE__;
  vi.useRealTimers();
});

describe("useAuthContext", () => {
  it("throws when used outside a ClientAuthProvider", () => {
    // React logs the thrown error to the console too; that's expected noise
    // for this case, matching how other error-path tests in this suite work.
    expect(() => render(<Consumer />)).toThrow("useAuthContext must be used within an AuthProvider");
  });
});

describe("ClientAuthProvider — initial state", () => {
  it("defaults to unauthenticated with no initial state and no permissions", async () => {
    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );

    expect(screen.getByText("user: null")).toBeInTheDocument();
    expect(screen.getByText("isAuthenticated: false")).toBeInTheDocument();
    expect(screen.getByText("canManageAll: false")).toBeInTheDocument();

    await vi.waitFor(() => expect(checkAuthAction).toHaveBeenCalledTimes(1));
  });

  it("uses window.__INITIAL_AUTH_STATE__ when present, and does not re-check on mount", async () => {
    const user = makeUser();
    window.__INITIAL_AUTH_STATE__ = { user, isAuthenticated: true };

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );

    expect(screen.getByText("user: Current User")).toBeInTheDocument();
    expect(screen.getByText("isAuthenticated: true")).toBeInTheDocument();
    expect(screen.getByText("canManageAll: true")).toBeInTheDocument();

    // Give any stray microtask a chance to run, then confirm no auth check fired.
    await act(async () => {
      await Promise.resolve();
    });
    expect(checkAuthAction).not.toHaveBeenCalled();
  });
});

describe("ClientAuthProvider — refreshAuth", () => {
  it("calls checkAuthAction exactly once on mount when there is no user (regression: no runaway loop)", async () => {
    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );

    await vi.waitFor(() => expect(checkAuthAction).toHaveBeenCalledTimes(1));
    // Give a few more ticks a chance — the bug this guards against would
    // keep firing calls indefinitely once triggered.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(checkAuthAction).toHaveBeenCalledTimes(1);
  });

  it("updates the context when refreshAuth resolves with a user", async () => {
    const user = userEvent.setup();
    vi.mocked(checkAuthAction).mockResolvedValue({ user: makeUser({ name: "Refreshed User" }), isAuthenticated: true });

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );
    await user.click(screen.getByRole("button", { name: "refresh" }));

    expect(await screen.findByText("user: Refreshed User")).toBeInTheDocument();
    expect(screen.getByText("isAuthenticated: true")).toBeInTheDocument();
  });

  it("resets to unauthenticated when refreshAuth throws", async () => {
    window.__INITIAL_AUTH_STATE__ = { user: makeUser(), isAuthenticated: true };
    vi.mocked(checkAuthAction).mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );
    expect(screen.getByText("isAuthenticated: true")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "refresh" }));

    expect(await screen.findByText("user: null")).toBeInTheDocument();
    expect(screen.getByText("isAuthenticated: false")).toBeInTheDocument();
  });
});

describe("ClientAuthProvider — cross-tab and token-refresh sync", () => {
  it("refreshes when a storage event with key 'auth_changed' fires", async () => {
    window.__INITIAL_AUTH_STATE__ = { user: makeUser(), isAuthenticated: true };

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(checkAuthAction).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "auth_changed" }));
    });

    await vi.waitFor(() => expect(checkAuthAction).toHaveBeenCalledTimes(1));
  });

  it("ignores storage events for unrelated keys", async () => {
    window.__INITIAL_AUTH_STATE__ = { user: makeUser(), isAuthenticated: true };

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "some_other_key" }));
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(checkAuthAction).not.toHaveBeenCalled();
  });

  it("refreshes when a 'token_refreshed' event fires", async () => {
    window.__INITIAL_AUTH_STATE__ = { user: makeUser(), isAuthenticated: true };

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(checkAuthAction).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event("token_refreshed"));
    });

    await vi.waitFor(() => expect(checkAuthAction).toHaveBeenCalledTimes(1));
  });
});

describe("ClientAuthProvider — periodic refresh", () => {
  it("re-checks auth every 5 minutes", async () => {
    vi.useFakeTimers();
    window.__INITIAL_AUTH_STATE__ = { user: makeUser(), isAuthenticated: true };

    render(
      <ClientAuthProvider>
        <Consumer />
      </ClientAuthProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(checkAuthAction).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });
    expect(checkAuthAction).toHaveBeenCalledTimes(1);
  });
});
