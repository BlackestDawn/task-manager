import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { User } from "@task-manager/common";
import { useUserPermissions } from "./useUserPermissions";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { makeAuthContextValue } from "@/testHelpers/authContext";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    __typename: "User",
    id: OTHER_USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    login: "other",
    name: "Other User",
    email: null,
    disabled: false,
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

describe("useUserPermissions", () => {
  it("allows a manager to create users", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "manager" })
    );
    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.canCreateUser()).toBe(true);
  });

  it("does not allow a plain user to create users", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.canCreateUser()).toBe(false);
  });

  it("allows a user to view and edit their own profile, but not another user's", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useUserPermissions());
    const self = makeUser({ id: USER_ID });
    const other = makeUser({ id: OTHER_USER_ID });

    expect(result.current.canEditUser(self)).toBe(true);
    expect(result.current.canEditUser(other)).toBe(false);
    expect(result.current.canDeleteUser(other)).toBe(false);
  });

  it("forbids editing the login field even on your own profile", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useUserPermissions());
    const self = makeUser({ id: USER_ID });

    expect(result.current.canEditUserField(self, "login")).toBe(false);
    expect(result.current.canEditUserField(self, "name")).toBe(true);
  });

  it("allows a manager to delete another user", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "manager" })
    );
    const { result } = renderHook(() => useUserPermissions());
    const other = makeUser({ id: OTHER_USER_ID });

    expect(result.current.canDeleteUser(other)).toBe(true);
  });
});
