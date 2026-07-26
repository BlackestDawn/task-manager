import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { User } from "@task-manager/common";
import { ServerAuthProvider } from "./serverAuthProvider";
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
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(checkAuthAction).mockReset();
});

describe("ServerAuthProvider", () => {
  it("renders its children", async () => {
    render(await ServerAuthProvider({ children: <p>child content</p>, initialUser: null }));
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("uses the explicitly passed user without calling checkAuthAction", async () => {
    const user = makeUser({ name: "Explicit User" });
    const { container } = render(
      await ServerAuthProvider({ children: <p>child</p>, initialUser: user, initialIsAuthenticated: true })
    );

    expect(checkAuthAction).not.toHaveBeenCalled();
    const script = container.querySelector("script")!;
    expect(script.innerHTML).toContain('"isAuthenticated":true');
    expect(script.innerHTML).toContain('"name":"Explicit User"');
  });

  it("treats an explicit null user as 'known logged out' without calling checkAuthAction", async () => {
    const { container } = render(
      await ServerAuthProvider({ children: <p>child</p>, initialUser: null })
    );

    expect(checkAuthAction).not.toHaveBeenCalled();
    const script = container.querySelector("script")!;
    expect(script.innerHTML).toContain('"user":null');
    expect(script.innerHTML).toContain('"isAuthenticated":false');
  });

  it("falls back to checkAuthAction when initialUser is not passed at all", async () => {
    vi.mocked(checkAuthAction).mockResolvedValue({ user: makeUser({ name: "Detected User" }), isAuthenticated: true });

    const { container } = render(await ServerAuthProvider({ children: <p>child</p> }));

    expect(checkAuthAction).toHaveBeenCalledTimes(1);
    const script = container.querySelector("script")!;
    expect(script.innerHTML).toContain('"name":"Detected User"');
    expect(script.innerHTML).toContain('"isAuthenticated":true');
  });
});
