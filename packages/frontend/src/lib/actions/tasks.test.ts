import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@task-manager/common";
import {
  getTasksAction,
  getTaskAction,
  getTaskGroupsAction,
  createTaskAction,
  updateTaskAction,
  updateTaskDoneStatusAction,
  deleteTaskAction,
} from "./tasks";
import { serverGet, serverPost, serverPut, serverDelete } from "@/lib/utils/serverFetch";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/utils/serverFetch", () => ({
  serverGet: vi.fn(),
  serverPost: vi.fn(),
  serverPut: vi.fn(),
  serverDelete: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const TASK_ID = "323e4567-e89b-12d3-a456-426614174000";
const USER_ID = "123e4567-e89b-12d3-a456-426614174000";

function makeTask(overrides: Partial<Task> = {}): Task {
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
  vi.mocked(serverGet).mockReset();
  vi.mocked(serverPost).mockReset();
  vi.mocked(serverPut).mockReset();
  vi.mocked(serverDelete).mockReset();
  vi.mocked(revalidatePath).mockReset();
});

describe("getTasksAction", () => {
  it("returns the tasks on success", async () => {
    vi.mocked(serverGet).mockResolvedValue([makeTask()]);
    const result = await getTasksAction();
    expect(result).toHaveLength(1);
  });

  it("returns an empty array when the API call fails", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("network error"));
    const result = await getTasksAction();
    expect(result).toEqual([]);
  });
});

describe("getTaskAction", () => {
  it("returns the task on success", async () => {
    vi.mocked(serverGet).mockResolvedValue(makeTask());
    const result = await getTaskAction(TASK_ID);
    expect(result?.id).toBe(TASK_ID);
  });

  it("returns null when the API call fails", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("not found"));
    const result = await getTaskAction(TASK_ID);
    expect(result).toBeNull();
  });
});

describe("getTaskGroupsAction", () => {
  it("returns an empty array when the API call fails", async () => {
    vi.mocked(serverGet).mockRejectedValue(new Error("not found"));
    const result = await getTaskGroupsAction(TASK_ID);
    expect(result).toEqual([]);
  });
});

describe("createTaskAction", () => {
  it("creates the task and revalidates tasks + dashboard on success", async () => {
    vi.mocked(serverPost).mockResolvedValue(makeTask({ title: "New" }));

    const result = await createTaskAction({ title: "New", description: null, finishBy: null, userId: USER_ID });

    expect(result).toEqual({ success: true, task: expect.objectContaining({ title: "New" }) });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPost).mockRejectedValue(new Error("Task creation failed"));

    const result = await createTaskAction({ title: "New", description: null, finishBy: null, userId: USER_ID });

    expect(result).toEqual({ success: false, error: "Task creation failed" });
  });

  it("returns a failure result for invalid input without calling the API", async () => {
    const result = await createTaskAction({ title: "", description: null, finishBy: null, userId: USER_ID });

    expect(result.success).toBe(false);
    expect(serverPost).not.toHaveBeenCalled();
  });
});

describe("updateTaskAction", () => {
  it("updates the task and revalidates all relevant paths on success", async () => {
    vi.mocked(serverPut).mockResolvedValue(makeTask({ title: "Updated" }));

    const result = await updateTaskAction(TASK_ID, { title: "Updated", description: null, finishBy: null });

    expect(result).toEqual({ success: true, task: expect.objectContaining({ title: "Updated" }) });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith(`/tasks/${TASK_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("Task update failed"));

    const result = await updateTaskAction(TASK_ID, { title: "Updated", description: null, finishBy: null });

    expect(result).toEqual({ success: false, error: "Task update failed" });
  });
});

describe("updateTaskDoneStatusAction", () => {
  it("marks the task done and revalidates on success", async () => {
    vi.mocked(serverPut).mockResolvedValue(makeTask({ completed: true }));

    const result = await updateTaskDoneStatusAction(TASK_ID, { completed: true });

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith(`/tasks/${TASK_ID}`);
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverPut).mockRejectedValue(new Error("Updating task status failed"));

    const result = await updateTaskDoneStatusAction(TASK_ID, { completed: true });

    expect(result).toEqual({ success: false, error: "Updating task status failed" });
  });
});

describe("deleteTaskAction", () => {
  it("deletes the task and revalidates on success", async () => {
    vi.mocked(serverDelete).mockResolvedValue(undefined);

    const result = await deleteTaskAction(TASK_ID);

    expect(result).toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a failure result when the API call fails", async () => {
    vi.mocked(serverDelete).mockRejectedValue(new Error("Task deletion failed"));

    const result = await deleteTaskAction(TASK_ID);

    expect(result).toEqual({ success: false, error: "Task deletion failed" });
  });
});
