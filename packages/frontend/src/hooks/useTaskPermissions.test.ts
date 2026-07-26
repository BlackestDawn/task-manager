import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Task } from "@task-manager/common";
import { useTaskPermissions } from "./useTaskPermissions";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { makeAuthContextValue } from "@/testHelpers/authContext";

vi.mock("@/components/auth/clientAuthProvider", () => ({
  useAuthContext: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const GROUP_ID = "423e4567-e89b-12d3-a456-426614174000";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    __typename: "Task",
    id: "523e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "A task",
    description: null,
    finishBy: null,
    userId: USER_ID,
    completed: false,
    completedAt: null,
    groups: [],
    ...overrides,
  };
}

describe("useTaskPermissions", () => {
  it("allows any authenticated user to create tasks", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useTaskPermissions());

    expect(result.current.canCreateTasks()).toBe(true);
  });

  it("lets a user manage their own task", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useTaskPermissions());
    const ownTask = makeTask({ userId: USER_ID });

    expect(result.current.canViewTask(ownTask)).toBe(true);
    expect(result.current.canUpdateTask(ownTask)).toBe(true);
    expect(result.current.canDeleteTask(ownTask)).toBe(true);
    expect(result.current.canMarkDone(ownTask)).toBe(true);
  });

  it("does not let a user manage someone else's unrelated task", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, accessLevel: "user" })
    );
    const { result } = renderHook(() => useTaskPermissions());
    const othersTask = makeTask({ userId: "223e4567-e89b-12d3-a456-426614174000" });

    expect(result.current.canUpdateTask(othersTask)).toBe(false);
    expect(result.current.canMarkDone(othersTask)).toBe(false);
  });

  it("lets a 'user' role group member mark a group task done without update rights", () => {
    // Regression guard for the canEditObjectField -> canMarkTaskDone fix:
    // "user" role only has the markDone action, not update, on group tasks.
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, groups: [{ id: GROUP_ID, role: "user" }] })
    );
    const { result } = renderHook(() => useTaskPermissions());
    const groupTask = makeTask({ userId: "223e4567-e89b-12d3-a456-426614174000", groups: [{ id: GROUP_ID }] });

    expect(result.current.canMarkDone(groupTask)).toBe(true);
    expect(result.current.canUpdateTask(groupTask)).toBe(false);
  });

  it("does not let a viewer mark a group task done", () => {
    vi.mocked(useAuthContext).mockReturnValue(
      makeAuthContextValue({ id: USER_ID, groups: [{ id: GROUP_ID, role: "viewer" }] })
    );
    const { result } = renderHook(() => useTaskPermissions());
    const groupTask = makeTask({ userId: "223e4567-e89b-12d3-a456-426614174000", groups: [{ id: GROUP_ID }] });

    expect(result.current.canMarkDone(groupTask)).toBe(false);
  });
});
