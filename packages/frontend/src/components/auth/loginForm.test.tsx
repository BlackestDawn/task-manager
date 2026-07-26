import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor } from "@task-manager/common";
import LoginForm from "./loginForm";
import { loginAction } from "@/lib/actions/auth";
import { tokenManager } from "@/lib/utils/tokenManager";
import { useAuthContext } from "./clientAuthProvider";
import { useRouter } from "next/navigation";

// LoginForm only ever destructures `refreshAuth` off the context.
const UNUSED_ABILITY = defineAbilityFor(null);

vi.mock("@/lib/actions/auth", () => ({
  loginAction: vi.fn(),
}));

vi.mock("@/lib/utils/tokenManager", () => ({
  tokenManager: { setToken: vi.fn() },
}));

vi.mock("./clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

let refreshAuth: ReturnType<typeof vi.fn>;
let routerPush: ReturnType<typeof vi.fn>;
let routerRefresh: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.mocked(loginAction).mockReset();
  vi.mocked(tokenManager.setToken).mockReset();

  refreshAuth = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useAuthContext).mockReturnValue({
    user: null,
    isAuthenticated: false,
    ability: UNUSED_ABILITY,
    refreshAuth,
  });

  routerPush = vi.fn();
  routerRefresh = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    push: routerPush,
    refresh: routerRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  });

  localStorage.clear();
});

describe("LoginForm", () => {
  it("logs in and navigates to the default redirect on success", async () => {
    const user = userEvent.setup();
    vi.mocked(loginAction).mockResolvedValue({
      success: true,
      tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "correctPassword123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/dashboard"));

    expect(loginAction).toHaveBeenCalledWith({ login: "testuser", password: "correctPassword123" });
    expect(tokenManager.setToken).toHaveBeenCalledWith("access-1", "refresh-1");
    expect(refreshAuth).toHaveBeenCalledTimes(1);
    expect(routerRefresh).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("auth_changed")).not.toBeNull();
  });

  it("navigates to a custom redirectTo on success", async () => {
    const user = userEvent.setup();
    vi.mocked(loginAction).mockResolvedValue({
      success: true,
      tokens: { accessToken: "access-1", refreshToken: "refresh-1" },
    });

    render(<LoginForm redirectTo="/tasks" />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "correctPassword123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/tasks"));
  });

  it("shows the server's error message and does not navigate on failed login", async () => {
    const user = userEvent.setup();
    vi.mocked(loginAction).mockResolvedValue({
      success: false,
      error: "invalid username or password",
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "wrongPassword1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("invalid username or password")).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
    expect(tokenManager.setToken).not.toHaveBeenCalled();
  });

  it("falls back to a generic error message when the action returns an empty one", async () => {
    const user = userEvent.setup();
    vi.mocked(loginAction).mockResolvedValue({ success: false, error: "" });

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "wrongPassword1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Login failed")).toBeInTheDocument();
  });

  it("disables the form and shows a pending label while the login is in flight", async () => {
    const user = userEvent.setup();
    let resolveLogin!: (value: Awaited<ReturnType<typeof loginAction>>) => void;
    vi.mocked(loginAction).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "testuser");
    await user.type(screen.getByLabelText("Password"), "correctPassword123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("button", { name: /signing in/i })).toBeDisabled();
    expect(screen.getByLabelText("Username")).toBeDisabled();

    resolveLogin({ success: true, tokens: { accessToken: "a", refreshToken: "r" } });
    await waitFor(() => expect(routerPush).toHaveBeenCalled());
  });
});
