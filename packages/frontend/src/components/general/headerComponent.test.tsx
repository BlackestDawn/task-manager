import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defineAbilityFor } from "@task-manager/common";
import HeaderComponent from "./headerComponent";
import { logoutAction } from "@/lib/actions/auth";
import { tokenManager } from "@/lib/utils/tokenManager";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { useRouter } from "next/navigation";

// HeaderComponent only ever destructures `refreshAuth` off the context.
const UNUSED_ABILITY = defineAbilityFor(null);

vi.mock("@/lib/actions/auth", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/lib/utils/tokenManager", () => ({
  tokenManager: { clearTokens: vi.fn() },
}));

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

let refreshAuth: ReturnType<typeof vi.fn>;
let routerPush: ReturnType<typeof vi.fn>;
let routerRefresh: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.mocked(logoutAction).mockReset().mockResolvedValue(undefined as never);
  vi.mocked(tokenManager.clearTokens).mockReset();

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

describe("HeaderComponent", () => {
  it("shows the site title and the static menu links", () => {
    render(<HeaderComponent isAuthenticated={false} />);

    expect(screen.getByText("Task Manager")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Dashboard" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Tasks" }).length).toBeGreaterThan(0);
  });

  it("shows a Login link when not authenticated", () => {
    render(<HeaderComponent isAuthenticated={false} />);

    const loginLinks = screen.getAllByRole("link", { name: "Login" });
    expect(loginLinks.length).toBeGreaterThan(0);
    for (const link of loginLinks) {
      expect(link).toHaveAttribute("href", "/login");
    }
  });

  it("shows a Logout button instead of Login when authenticated", () => {
    render(<HeaderComponent isAuthenticated={true} />);

    expect(screen.getAllByRole("button", { name: /logout/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
  });

  it("toggles the hamburger's aria-expanded state when clicked", async () => {
    const user = userEvent.setup();
    render(<HeaderComponent isAuthenticated={false} />);

    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("logs out, clears tokens, refreshes auth, flags other tabs, and navigates home", async () => {
    const user = userEvent.setup();
    render(<HeaderComponent isAuthenticated={true} />);

    await user.click(screen.getAllByRole("button", { name: /logout/i })[0]!);

    await vi.waitFor(() => expect(routerPush).toHaveBeenCalledWith("/"));
    expect(logoutAction).toHaveBeenCalledTimes(1);
    expect(tokenManager.clearTokens).toHaveBeenCalledTimes(1);
    expect(refreshAuth).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("auth_changed")).not.toBeNull();
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });
});
