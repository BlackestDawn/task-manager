import { describe, it, expect } from "vitest";
import { withTestTx } from "../testHelpers/testDb";
import {
  insertTestUser,
  insertTestGroup,
  insertTestTask,
  insertTestUserGroup,
  insertTestTaskGroup,
} from "../testHelpers/fixtures";
import { AlreadyExistsConflictError } from "@task-manager/common";
import {
  getGroupById,
  getGroups,
  createGroup,
  updateGroup,
  removeGroup,
  addUserToGroup,
  removeUserFromGroup,
  getGroupMembers,
  assignTaskToGroup,
  removeTaskFromGroup,
  getGroupTasks,
} from "./groups";

describe("getGroupById", () => {
  it("returns the group by id", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx, { name: "Engineering" });
      const result = await getGroupById(tx, { id: group.id });
      expect(result?.name).toBe("Engineering");
    });
  });

  it("returns null when the group does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await getGroupById(tx, { id: "00000000-0000-0000-0000-000000000000" });
      expect(result).toBeNull();
    });
  });
});

describe("getGroups", () => {
  it("returns groups with user and task counts", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx);
      const user = await insertTestUser(tx);
      await insertTestUserGroup(tx, user.id, group.id);
      const task = await insertTestTask(tx, user.id);
      await insertTestTaskGroup(tx, task.id, group.id);

      const result = await getGroups(tx);
      const found = result.find((g) => g.id === group.id);
      // Regression guard: count(*) is bigint, which postgres.js returns as
      // a string by default — the query casts to ::int so these must come
      // back as real numbers, matching the sql<number> type.
      expect(found?.userCount).toBe(1);
      expect(typeof found?.userCount).toBe("number");
      expect(found?.taskCount).toBe(1);
      expect(typeof found?.taskCount).toBe("number");
    });
  });

  it("reports zero counts for a group with no members or tasks", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx);
      const result = await getGroups(tx);
      const found = result.find((g) => g.id === group.id);
      expect(found?.userCount).toBe(0);
      expect(found?.taskCount).toBe(0);
    });
  });
});

describe("createGroup", () => {
  it("creates and returns a group", async () => {
    await withTestTx(async (tx) => {
      const result = await createGroup(tx, { name: "New Group", description: "desc" });
      expect(result.name).toBe("New Group");
    });
  });

  it("throws AlreadyExistsConflictError for a duplicate name", async () => {
    await withTestTx(async (tx) => {
      await insertTestGroup(tx, { name: "Duplicate" });
      await expect(
        createGroup(tx, { name: "Duplicate", description: null })
      ).rejects.toThrow(AlreadyExistsConflictError);
    });
  });
});

describe("updateGroup", () => {
  it("updates and returns the group", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx, { name: "Old Name" });
      const result = await updateGroup(tx, {
        id: group.id,
        data: { name: "New Name", description: null },
      });
      expect(result?.name).toBe("New Name");
    });
  });

  it("returns null when the group does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await updateGroup(tx, {
        id: "00000000-0000-0000-0000-000000000000",
        data: { name: "New Name", description: null },
      });
      expect(result).toBeNull();
    });
  });
});

describe("removeGroup", () => {
  it("removes the group", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx);
      await removeGroup(tx, { id: group.id });

      const result = await getGroups(tx);
      expect(result.map((g) => g.id)).not.toContain(group.id);
    });
  });
});

describe("addUserToGroup", () => {
  it("adds the user to the group", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);

      await addUserToGroup(tx, { id: group.id, data: { userId: user.id, role: "editor" } });

      const members = await getGroupMembers(tx, { id: group.id });
      expect(members.map((m) => m.id)).toContain(user.id);
    });
  });

  it("throws AlreadyExistsConflictError when the user is already a member", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id);

      await expect(
        addUserToGroup(tx, { id: group.id, data: { userId: user.id, role: "editor" } })
      ).rejects.toThrow(AlreadyExistsConflictError);
    });
  });
});

describe("removeUserFromGroup", () => {
  it("removes the user from the group", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id);

      await removeUserFromGroup(tx, { id: group.id, data: { userId: user.id } });

      const members = await getGroupMembers(tx, { id: group.id });
      expect(members.map((m) => m.id)).not.toContain(user.id);
    });
  });
});

describe("getGroupMembers", () => {
  it("returns members with their group role", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id, { role: "supervisor" });

      const result = await getGroupMembers(tx, { id: group.id });
      const found = result.find((m) => m.id === user.id);
      expect(found?.groups).toEqual([{ id: group.id, role: "supervisor" }]);
    });
  });

  it("returns an empty array for a group with no members", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx);
      const result = await getGroupMembers(tx, { id: group.id });
      expect(result).toEqual([]);
    });
  });
});

describe("assignTaskToGroup", () => {
  it("assigns the task to the group", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);

      await assignTaskToGroup(tx, { id: group.id, data: { taskId: task.id, assignedBy: user.id } });

      const tasks = await getGroupTasks(tx, { id: group.id });
      expect(tasks.map((t) => t.id)).toContain(task.id);
    });
  });

  it("throws AlreadyExistsConflictError when the task is already assigned", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task.id, group.id);

      await expect(
        assignTaskToGroup(tx, { id: group.id, data: { taskId: task.id, assignedBy: user.id } })
      ).rejects.toThrow(AlreadyExistsConflictError);
    });
  });
});

describe("removeTaskFromGroup", () => {
  it("removes the task from the group", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task.id, group.id);

      await removeTaskFromGroup(tx, { id: group.id, data: { taskId: task.id } });

      const tasks = await getGroupTasks(tx, { id: group.id });
      expect(tasks.map((t) => t.id)).not.toContain(task.id);
    });
  });
});

describe("getGroupTasks", () => {
  it("returns tasks assigned to the group with their full group objects", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const task = await insertTestTask(tx, user.id);
      const group = await insertTestGroup(tx);
      await insertTestTaskGroup(tx, task.id, group.id);

      const result = await getGroupTasks(tx, { id: group.id });
      expect(result).toHaveLength(1);
      expect(result[0]!.groups.map((g) => g.id)).toEqual([group.id]);
    });
  });

  it("returns an empty array for a group with no tasks", async () => {
    await withTestTx(async (tx) => {
      const group = await insertTestGroup(tx);
      const result = await getGroupTasks(tx, { id: group.id });
      expect(result).toEqual([]);
    });
  });
});
