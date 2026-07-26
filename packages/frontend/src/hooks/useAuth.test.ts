import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { defineAbilityFor, type User } from "@task-manager/common";
import { useAuth } from "./useAuth";
import { useAuthContext } from "@/components/auth/clientAuthProvider";

// useAuth computes its own ability from `user` via defineAbilityFor — it
// never reads context.ability — so this is just a type-correct placeholder.
const UNUSED_ABILITY = defineAbilityFor(null);

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
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
    accessLevel: "user" as const,
    groups: [],
    ...overrides,
  };
}

describe("useAuth", () => {
  it("returns the user and isAuthenticated from context", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: makeUser(),
      isAuthenticated: true,
      ability: UNUSED_ABILITY,
      refreshAuth: async () => {},
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.id).toBe(USER_ID);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("derives an ability that reflects the current user's permissions", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: makeUser({ accessLevel: "admin" }),
      isAuthenticated: true,
      ability: UNUSED_ABILITY,
      refreshAuth: async () => {},
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.ability.can("manage", "all")).toBe(true);
  });

  it("derives a no-permissions ability when there is no user", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      isAuthenticated: false,
      ability: UNUSED_ABILITY,
      refreshAuth: async () => {},
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.ability.can("read", "User")).toBe(false);
  });
});
