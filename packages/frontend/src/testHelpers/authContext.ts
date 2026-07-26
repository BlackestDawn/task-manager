import { defineAbilityFor, type User, type UserContext } from "@task-manager/common";
import type { AuthContextType } from "@/lib/data/interfaces/auth";

// Builds a real AuthContextType value (real CASL ability via defineAbilityFor,
// not a mock) so hook tests exercise actual permission wiring — the same
// reasoning as the backend handler tests: a stubbed canXxxObject() would
// never catch a permission-string or role-mapping bug.
export function makeAuthContextValue(
  user: (Partial<User> & Pick<User, "id">) | null
): AuthContextType {
  const fullUser: User | null = user
    ? {
        __typename: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
        login: "testuser",
        name: "Test User",
        email: null,
        disabled: false,
        accessLevel: "user",
        groups: [],
        ...user,
      }
    : null;

  return {
    user: fullUser,
    isAuthenticated: Boolean(fullUser),
    ability: defineAbilityFor(fullUser as UserContext | null),
    refreshAuth: async () => {},
  };
}
