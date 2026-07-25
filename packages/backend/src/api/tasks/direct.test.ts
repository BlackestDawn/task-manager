import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerUpdateTask, handlerDeleteTask, handlerGetTaskById } from "./direct";
import { updateTask, deleteTask, getTaskById } from "../../db/queries/tasks";
import { makeContext } from "../testHelpers/mockContext";
import { makeAbilities } from "../testHelpers/permissions";

vi.mock("../../db/queries/tasks", () => ({
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  getTaskById: vi.fn(),
}));

const USER_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_USER_ID = "223e4567-e89b-12d3-a456-426614174000";
const TASK_ID = "323e4567-e89b-12d3-a456-426614174000";

function makeTaskRow(overrides: Record<string, unknown> = {}) {
  return {
    __typename: "Task",
    id: TASK_ID,
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
  vi.mocked(updateTask).mockReset();
  vi.mocked(deleteTask).mockReset();
  vi.mocked(getTaskById).mockReset();
});

describe("handlerUpdateTask", () => {
  it("updates a task the user owns", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow() as any);
    vi.mocked(updateTask).mockResolvedValue(makeTaskRow({ title: "Updated" }) as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { title: "Updated", description: null, finishBy: null },
    });
    const result = await handlerUpdateTask(c) as any;

    expect(result.data.title).toBe("Updated");
  });

  it("throws NotFoundError when the task does not exist", async () => {
    vi.mocked(getTaskById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { title: "Updated", description: null, finishBy: null },
    });

    await expect(handlerUpdateTask(c)).rejects.toThrow("Task not found");
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("throws UserForbiddenError when the user doesn't own the task and isn't in its group", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow({ userId: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { title: "Updated", description: null, finishBy: null },
    });

    await expect(handlerUpdateTask(c)).rejects.toThrow("User not authorized");
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("throws NotFoundError if the task is deleted between the existence check and the update", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow() as any);
    vi.mocked(updateTask).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
      jsonBody: { title: "Updated", description: null, finishBy: null },
    });

    await expect(handlerUpdateTask(c)).rejects.toThrow("Task not found");
  });
});

describe("handlerDeleteTask", () => {
  it("deletes a task the user owns", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow() as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerDeleteTask(c) as any;

    expect(result.status).toBe(204);
    expect(deleteTask).toHaveBeenCalledWith(expect.anything(), { id: TASK_ID });
  });

  it("throws NotFoundError when the task does not exist", async () => {
    vi.mocked(getTaskById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerDeleteTask(c)).rejects.toThrow("Task not found");
    expect(deleteTask).not.toHaveBeenCalled();
  });

  it("throws UserForbiddenError for someone else's task", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow({ userId: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerDeleteTask(c)).rejects.toThrow("User not authorized");
    expect(deleteTask).not.toHaveBeenCalled();
  });
});

describe("handlerGetTaskById", () => {
  it("returns a viewable task", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow() as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });
    const result = await handlerGetTaskById(c) as any;

    expect(result.data.id).toBe(TASK_ID);
  });

  it("throws NotFoundError when the task does not exist", async () => {
    vi.mocked(getTaskById).mockResolvedValue(null);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetTaskById(c)).rejects.toThrow("Task not found");
  });

  it("throws UserForbiddenError for a task outside the user's visibility", async () => {
    vi.mocked(getTaskById).mockResolvedValue(makeTaskRow({ userId: OTHER_USER_ID }) as any);

    const c = makeContext({
      get: { recID: { id: TASK_ID }, capabilities: makeAbilities({ id: USER_ID }) },
    });

    await expect(handlerGetTaskById(c)).rejects.toThrow("User not authorized");
  });
});
