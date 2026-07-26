import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Group } from "@task-manager/common";
import { useGroupPermissions } from "./useGroupPermissions";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { makeAuthContextValue } from "@/testHelpers/authContext";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const GROUP_ID = "423e4567-e89b-12d3-a456-426614174000";

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    __typename: "Group",
    id: GROUP_ID,
    name: "Engineering",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("useGroupPermissions", () => {
  it("allows a manager to create and view groups", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "manager" })
    );
    const { result } = renderHook(() => useGroupPermissions());

    expect(result.current.canCreateGroups()).toBe(true);
    expect(result.current.canViewGroups()).toBe(true);
  });

  it("does not allow a plain user to create groups", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useGroupPermissions());

    expect(result.current.canCreateGroups()).toBe(false);
  });

  it("gives a supervisor update rights but not delete rights on their group", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] })
    );
    const { result } = renderHook(() => useGroupPermissions());
    const group = makeGroup();

    expect(result.current.canUpdateGroup(group)).toBe(true);
    expect(result.current.canDeleteGroup(group)).toBe(false);
  });

  it("combines add/remove user rights into canManageGroupUsers (AND semantics)", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, groups: [{ id: GROUP_ID, role: "supervisor" }] })
    );
    const { result } = renderHook(() => useGroupPermissions());
    const group = makeGroup();

    expect(result.current.canAddUserToGroup(group)).toBe(true);
    expect(result.current.canRemoveUserFromGroup(group)).toBe(true);
    expect(result.current.canManageGroupUsers(group)).toBe(true);
  });

  it("combines assign/remove task rights into canManageGroupTasks (OR semantics)", () => {
    // Editor can assignTask but not removeTask — canManageGroupTasks should
    // still be true since it's an OR, not an AND.
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, groups: [{ id: GROUP_ID, role: "editor" }] })
    );
    const { result } = renderHook(() => useGroupPermissions());
    const group = makeGroup();

    expect(result.current.canAssignTaskToGroup(group)).toBe(true);
    expect(result.current.canRemoveTaskFromGroup(group)).toBe(false);
    expect(result.current.canManageGroupTasks(group)).toBe(true);
  });

  describe("getUserRoleInGroup", () => {
    it("returns the user's role for a group they belong to", () => {
      vi.mocked(useAuthContext).mockReturnValue(
        makeAuthContextValue({ id: USER_ID, groups: [{ id: GROUP_ID, role: "viewer" }] })
      );
      const { result } = renderHook(() => useGroupPermissions());

      expect(result.current.getUserRoleInGroup(GROUP_ID)).toBe("viewer");
    });

    it("returns null for a group the user doesn't belong to", () => {
      vi.mocked(useAuthContext).mockReturnValue(makeAuthContextValue({ id: USER_ID, groups: [] }));
      const { result } = renderHook(() => useGroupPermissions());

      expect(result.current.getUserRoleInGroup(GROUP_ID)).toBeNull();
    });

    it("returns null when there is no user", () => {
      vi.mocked(useAuthContext).mockReturnValue(makeAuthContextValue(null));
      const { result } = renderHook(() => useGroupPermissions());

      expect(result.current.getUserRoleInGroup(GROUP_ID)).toBeNull();
    });
  });
});
