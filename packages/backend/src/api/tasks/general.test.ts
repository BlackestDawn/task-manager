import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "@task-manager/common";
import { handlerGetTasksByUserId, handlerCreateTask } from "./general";
import { createTask, getAllTasksForUser, getAllTasks } from "../../db/queries/tasks";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/tasks", () => ({
  createTask: vi.fn(),
  getAllTasksForUser: vi.fn(),
  getAllTasks: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";

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
    accessLevel: "user",
    groups: [],
    ...overrides,
  };
}

function makeTaskRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "Task",
    id: "323e4567-e89b-12d3-a456-426614174000",
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

beforeEach(() => {
  vi.mocked(createTask).mockReset();
  vi.mocked(getAllTasksForUser).mockReset();
  vi.mocked(getAllTasks).mockReset();
});

describe("handlerGetTasksByUserId", () => {
  it("fetches all tasks for an admin user", async () => {
    const admin = makeUser({ accessLevel: "admin" });
    vi.mocked(getAllTasks).mockResolvedValue([
      makeTaskRow({ userId: OTHER_USER_ID }),
      makeTaskRow({ userId: USER_ID }),
    ] as any);

    const c = makeContext({
      get: { user: admin, capabilities: makeAbilities({ id: admin.id, accessLevel: "admin" }) },
    });
    const result = await handlerGetTasksByUserId(c) as any;

    expect(getAllTasks).toHaveBeenCalledTimes(1);
    expect(getAllTasksForUser).not.toHaveBeenCalled();
    expect(result.data).toHaveLength(2);
  });

  it("fetches only own/group tasks for a non-admin user and filters by visibility", async () => {
    const user = makeUser({ accessLevel: "user" });
    vi.mocked(getAllTasksForUser).mockResolvedValue([
      makeTaskRow({ userId: USER_ID }),
    ] as any);

    const c = makeContext({
      get: { user, capabilities: makeAbilities({ id: user.id, accessLevel: "user" }) },
    });
    const result = await handlerGetTasksByUserId(c) as any;

    expect(getAllTasksForUser).toHaveBeenCalledWith(expect.anything(), { id: USER_ID });
    expect(getAllTasks).not.toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
  });

  it("excludes tasks the ability check rejects, even if the query returned them", async () => {
    const user = makeUser({ accessLevel: "user" });
    // A task belonging to someone else, unrelated to any shared group —
    // getAllTasksForUser shouldn't return this in practice, but the handler
    // must still filter defensively via abilities.
    vi.mocked(getAllTasksForUser).mockResolvedValue([
      makeTaskRow({ userId: OTHER_USER_ID }),
    ] as any);

    const c = makeContext({
      get: { user, capabilities: makeAbilities({ id: user.id, accessLevel: "user" }) },
    });
    const result = await handlerGetTasksByUserId(c) as any;

    expect(result.data).toEqual([]);
  });
});

describe("handlerCreateTask", () => {
  it("creates a task owned by the authenticated user", async () => {
    const user = makeUser();
    vi.mocked(createTask).mockResolvedValue(makeTaskRow({ title: "New Task" }) as any);

    const c = makeContext({
      get: { user, capabilities: makeAbilities({ id: user.id, accessLevel: "user" }) },
      jsonBody: { title: "New Task", description: null, finishBy: null },
    });
    const result = await handlerCreateTask(c) as any;

    expect(result.status).toBe(201);
    expect(createTask).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ title: "New Task", userId: USER_ID })
    );
  });

  it("ignores a client-supplied userId and always uses the authenticated user's id", async () => {
    const user = makeUser();
    vi.mocked(createTask).mockResolvedValue(makeTaskRow() as any);

    const c = makeContext({
      get: { user, capabilities: makeAbilities({ id: user.id, accessLevel: "user" }) },
      jsonBody: { title: "New Task", description: null, finishBy: null, userId: OTHER_USER_ID },
    });
    await handlerCreateTask(c);

    expect(createTask).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userId: USER_ID })
    );
  });

  it("rejects task creation for an anonymous ability context", async () => {
    const { AbilityChecker } = await import("@task-manager/common");
    const user = makeUser();
    const c = makeContext({
      get: { user, capabilities: new AbilityChecker({}) },
      jsonBody: { title: "New Task" },
    });

    await expect(handlerCreateTask(c)).rejects.toThrow("User not authorized");
    expect(createTask).not.toHaveBeenCalled();
  });
});
