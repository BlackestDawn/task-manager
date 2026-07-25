import { describe, it, expect } from "vitest";
import { withTestTx } from "../testHelpers/testDb";
import { insertTestUser, insertTestGroup, insertTestTask, insertTestTaskGroup, insertTestUserGroup } from "../testHelpers/fixtures";
import {
  getGroupsForTask,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTaskDoneStatus,
  getAllTasksForUser,
} from "./tasks";

describe("getGroupsForTask", () => {
  it("returns the groups the task is assigned to", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task.id, group.id);

      const result = await getGroupsForTask(tx, { id: task.id });
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(group.id);
    });
  });

  it("returns an empty array when the task has no groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);

      const result = await getGroupsForTask(tx, { id: task.id });
      expect(result).toEqual([]);
    });
  });
});

describe("createTask", () => {
  it("creates and returns a task with an empty groups array", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const result = await createTask(tx, {
        title: "New Task",
        description: "A description",
        finishBy: null,
        userId: user.id,
      });

      expect(result.title).toBe("New Task");
      expect(result.userId).toBe(user.id);
      expect(result.groups).toEqual([]);
    });
  });
});

describe("updateTask", () => {
  it("updates and returns the task with its group ids", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id, { title: "Original" });
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task.id, group.id);

      const result = await updateTask(tx, {
        id: task.id,
        data: { title: "Updated", description: null, finishBy: null },
      });

      expect(result?.title).toBe("Updated");
      expect(result?.groups).toEqual([{ id: group.id }]);
    });
  });

  it("returns null when the task does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await updateTask(tx, {
        id: "00000000-0000-0000-0000-000000000000",
        data: { title: "x", description: null, finishBy: null },
      });
      expect(result).toBeNull();
    });
  });
});

describe("deleteTask", () => {
  it("removes the task", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      await deleteTask(tx, { id: task.id });

      const remaining = await getAllTasks(tx);
      expect(remaining.map((t) => t.id)).not.toContain(task.id);
    });
  });
});

describe("getAllTasks", () => {
  it("returns all tasks with their group ids", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task1 = await insertTestTask(tx, user.id);
      const task2 = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task1.id, group.id);

      const result = await getAllTasks(tx);
      const ids = result.map((t) => t.id);
      expect(ids).toContain(task1.id);
      expect(ids).toContain(task2.id);

      const found1 = result.find((t) => t.id === task1.id);
      expect(found1?.groups).toEqual([{ id: group.id }]);
    });
  });
});

describe("getTaskById", () => {
  it("returns the task with its group ids", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task.id, group.id);

      const result = await getTaskById(tx, { id: task.id });
      expect(result?.id).toBe(task.id);
      expect(result?.groups).toEqual([{ id: group.id }]);
    });
  });

  it("returns null when the task does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await getTaskById(tx, { id: "00000000-0000-0000-0000-000000000000" });
      expect(result).toBeNull();
    });
  });
});

describe("updateTaskDoneStatus", () => {
  it("marks the task completed and sets completedAt", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id, { completed: false });

      const result = await updateTaskDoneStatus(tx, { id: task.id, data: { completed: true } });
      expect(result?.completed).toBe(true);
      expect(result?.completedAt).not.toBeNull();
    });
  });

  it("marks the task not completed and clears completedAt", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id, { completed: true, completedAt: new Date() });

      const result = await updateTaskDoneStatus(tx, { id: task.id, data: { completed: false } });
      expect(result?.completed).toBe(false);
      expect(result?.completedAt).toBeNull();
    });
  });

  it("returns null when the task does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await updateTaskDoneStatus(tx, {
        id: "00000000-0000-0000-0000-000000000000",
        data: { completed: true },
      });
      expect(result).toBeNull();
    });
  });
});

describe("getAllTasksForUser", () => {
  it("returns tasks owned directly by the user", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const otherUser = await insertTestUser(tx);
      const ownTask = await insertTestTask(tx, user.id);
      await insertTestTask(tx, otherUser.id);

      const result = await getAllTasksForUser(tx, { id: user.id });
      expect(result.map((t) => t.id)).toEqual([ownTask.id]);
    });
  });

  it("returns tasks assigned to a group the user belongs to, even if owned by someone else", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const otherUser = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id);

      const groupTask = await insertTestTask(tx, otherUser.id);
      await insertTestTaskGroup(tx, groupTask.id, group.id);

      const unrelatedTask = await insertTestTask(tx, otherUser.id);

      const result = await getAllTasksForUser(tx, { id: user.id });
      const ids = result.map((t) => t.id);
      expect(ids).toContain(groupTask.id);
      expect(ids).not.toContain(unrelatedTask.id);
    });
  });

  it("does not duplicate a task that is both owned and group-assigned", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id);

      const task = await insertTestTask(tx, user.id);
      await insertTestTaskGroup(tx, task.id, group.id);

      const result = await getAllTasksForUser(tx, { id: user.id });
      expect(result.filter((t) => t.id === task.id)).toHaveLength(1);
    });
  });
});
