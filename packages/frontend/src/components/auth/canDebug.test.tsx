import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { defineAbilityFor, type User } from "@task-manager/common";
import { CanDebug } from "./canDebug";
import { useAuthContext } from "./clientAuthProvider";

vi.mock("./clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function mockUser(overrides: Partial<User> = {}) {
  const user: User = {
    __typename: "User",
    id: USER_ID,
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
  vi.mocked(useAuthContext).mockReturnValue({
    user,
    isAuthenticated: true,
    ability: defineAbilityFor(user),
    refreshAuth: async () => {},
  });
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("CanDebug", () => {
  it("renders nothing outside of development", () => {
    vi.stubEnv("NODE_ENV", "production");
    mockUser();
    const { container } = render(<CanDebug action="manage" subject="all" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows ALLOWED for a granted action on a string subject", () => {
    mockUser({ accessLevel: "admin" });
    render(<CanDebug action="manage" subject="all" />);

    expect(screen.getByText("✓ ALLOWED")).toBeInTheDocument();
    expect(screen.getByText('"all"')).toBeInTheDocument();
  });

  it("shows DENIED for a forbidden action", () => {
    mockUser({ accessLevel: "user", groups: [] });
    render(<CanDebug action="create" subject="Group" />);

    expect(screen.getByText("✗ DENIED")).toBeInTheDocument();
  });

  it("shows the __typename warning for a plain object without __typename", () => {
    mockUser({ accessLevel: "admin" });
    render(<CanDebug action="update" subject={{ id: "x" } as never} />);

    expect(screen.getByText("⚠️ Missing __typename")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("shows the object's __typename when present", () => {
    mockUser({ accessLevel: "admin" });
    const subject = { __typename: "Group" as const, id: "g1", name: "Eng", description: null, createdAt: new Date(), updatedAt: new Date() };
    render(<CanDebug action="update" subject={subject} />);

    expect(screen.getByText("Group")).toBeInTheDocument();
    expect(screen.queryByText("⚠️ Missing __typename")).not.toBeInTheDocument();
  });

  it("shows the current user's name and access level", () => {
    mockUser({ name: "Debug User", accessLevel: "manager" });
    render(<CanDebug action="manage" subject="all" />);

    expect(screen.getByText("Debug User")).toBeInTheDocument();
    expect(screen.getByText("manager")).toBeInTheDocument();
  });
});
