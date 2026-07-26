import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { defineAbilityFor, type User } from "@task-manager/common";
import AuthStateDebugger from "./authStateDebugger";
import { useAuthContext } from "./clientAuthProvider";
import { checkAuthAction } from "@/lib/actions/auth";

vi.mock("./clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("@/lib/actions/auth", () => ({
  checkAuthAction: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "current",
    name: "Current User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

function mockContext(user: User | null) {
  vi.mocked(useAuthContext).mockReturnValue({
    user,
    isAuthenticated: !!user,
    ability: defineAbilityFor(user),
    refreshAuth: async () => {},
  });
}

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]!.trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.mocked(checkAuthAction).mockReset().mockResolvedValue({ user: null, isAuthenticated: false });
  delete window.__INITIAL_AUTH_STATE__;
  clearCookies();
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete window.__INITIAL_AUTH_STATE__;
  clearCookies();
});

describe("AuthStateDebugger", () => {
  it("renders nothing outside of development", () => {
    vi.stubEnv("NODE_ENV", "production");
    mockContext(null);
    const { container } = render(<AuthStateDebugger />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the context user and diagnoses a missing ServerAuthProvider when window state is absent", async () => {
    mockContext(makeUser({ name: "Context User" }));

    render(<AuthStateDebugger />);

    expect(screen.getByText(/Context User/)).toBeInTheDocument();
    expect(await screen.findByText("NOT SET - ServerAuthProvider missing?")).toBeInTheDocument();
    expect(screen.getByText(/ServerAuthProvider not rendering/)).toBeInTheDocument();
  });

  it("reports missing auth cookies when logged out with no window user", async () => {
    mockContext(null);
    window.__INITIAL_AUTH_STATE__ = { user: null, isAuthenticated: false };

    render(<AuthStateDebugger />);

    expect(await screen.findByText(/User not logged in - no auth cookies found/)).toBeInTheDocument();
    expect(screen.getAllByText("✗ Missing")).toHaveLength(2);
  });

  it("shows 'Everything looks good!' when window state and context both have a user", async () => {
    const user = makeUser({ name: "Synced User" });
    mockContext(user);
    window.__INITIAL_AUTH_STATE__ = { user, isAuthenticated: true };

    render(<AuthStateDebugger />);

    expect(await screen.findByText("✓ Everything looks good!")).toBeInTheDocument();
  });

  it("flags a hydration issue when window state has a user but context doesn't", async () => {
    mockContext(null);
    window.__INITIAL_AUTH_STATE__ = { user: makeUser(), isAuthenticated: true };

    render(<AuthStateDebugger />);

    expect(await screen.findByText(/hydration issue/)).toBeInTheDocument();
  });

  it("detects the presence of accessToken and refreshToken cookies", async () => {
    document.cookie = "accessToken=abc123; path=/";
    document.cookie = "refreshToken=def456; path=/";
    mockContext(null);

    render(<AuthStateDebugger />);

    const present = await screen.findAllByText("✓ Present");
    expect(present).toHaveLength(2);
  });

  it("shows the server auth state once checkAuthAction resolves", async () => {
    vi.mocked(checkAuthAction).mockResolvedValue({ user: makeUser({ name: "Server User" }), isAuthenticated: true });
    mockContext(null);

    render(<AuthStateDebugger />);

    expect(await screen.findByText(/Server User/)).toBeInTheDocument();
  });
});
