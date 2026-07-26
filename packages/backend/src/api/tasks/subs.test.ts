import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerMarkDone, handlerGetTaskGroups } from "./subs";
import { updateTaskDoneStatus, getGroupsForTask, getTaskById } from "../../db/queries/tasks";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/tasks", () => ({
  updateTaskDoneStatus: vi.fn(),
  getGroupsForTask: vi.fn(),
  getTaskById: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";
const TASK_ID = "323e4567-e89b-12d3-a456-426614174000";
const GROUP_ID = "423e4567-e89b-12d3-a456-426614174000";

function makeTaskRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "Task",
    id: TASK_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "A task",
    description: null,
    finishBy: null,
    userId: OTHER_USER_ID,
    completed: false,
    completedAt: null,
    groups: [{ id: GROUP_ID }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(updateTaskDoneStatus).mockReset();
  vi.mocked(getGroupsForTask).mockReset();
  vi.mocked(getTaskById).mockReset();
});

describe("handlerMarkDone", () => {
  it("allows a 'user' role group member to mark a task done, even without update rights", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow() as any);
    vi.mocked(updateTaskDoneStatus).mockResolvedValue(makeTaskRow({ completed: true }) as any);

    const c = makeContext({
      get: {
        recID: { id: TASK_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "user" }] }),
      },
      jsonBody: { completed: true },
    });
    const result = await handlerMarkDone(c) as any;

    expect(result.data.completed).toBe(true);
  });

  it("rejects a 'viewer' role group member", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow() as any);

    const c = makeContext({
      get: {
        recID: { id: TASK_ID },
        capabilities: makeAbilities({ id: USER_ID, groups: [{ id: GROUP_ID, role: "viewer" }] }),
      },
      jsonBody: { completed: true },
    });

    await expect(handlerMarkDone(c)).rejects.toThrow("User not authorized");
    expect(updateTaskDoneStatus).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the task does not exist", async () => {
    vi.mocked(getTaskById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { completed: true },
    });

    await expect(handlerMarkDone(c)).rejects.toThrow("Task not found");
  });

  it("throws NotFoundError if the task vanishes between the fetch and the update", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow({ userId: USER_ID, groups: [] }) as any);
    vi.mocked(updateTaskDoneStatus).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { completed: true },
    });

    await expect(handlerMarkDone(c)).rejects.toThrow("Task not found");
  });
});

describe("handlerGetTaskGroups", () => {
  it("returns the groups for a viewable task", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow({ userId: USER_ID }) as any);
    vi.mocked(getGroupsForTask).mockResolvedValue([
      { __typename: "Group", id: GROUP_ID, name: "G", description: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetTaskGroups(c) as any;

    expect(result.data).toHaveLength(1);
  });

  it("throws NotFoundError when the task does not exist", async () => {
    vi.mocked(getTaskById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetTaskGroups(c)).rejects.toThrow("Task not found");
  });

  it("throws UserForbiddenError for a task the user can't view", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow({ userId: OTHER_USER_ID, groups: [] }) as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetTaskGroups(c)).rejects.toThrow("User not authorized");
  });
});
