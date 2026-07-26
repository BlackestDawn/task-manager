import { describe, it, expect } from "vitest";
import { withTestTx } from "../testHelpers/testDb";
import { insertTestUser, insertTestGroup, insertTestUserGroup } from "../testHelpers/fixtures";
import { AlreadyExistsConflictError } from "@task-manager/common";
import {
  getGroupRolesForUser,
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserById,
  updatePassword,
  getUserByLogin,
  getGroupsForUser,
  updateUserDisabledStatus,
} from "./users";

describe("getGroupRolesForUser", () => {
  it("returns the group id and role for each membership", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id, { role: "editor" });

      const result = await getGroupRolesForUser(tx, { id: user.id });
      expect(result).toEqual([{ id: group.id, role: "editor" }]);
    });
  });

  it("returns an empty array when the user has no groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const result = await getGroupRolesForUser(tx, { id: user.id });
      expect(result).toEqual([]);
    });
  });
});

describe("createUser", () => {
  it("creates and returns a user with an empty groups array", async () => {
    await withTestTx(async (tx) => {
      const result = await createUser(tx, {
        login: "newlogin",
        password: "hashed",
        name: "New User",
        email: "new@example.com",
        accessLevel: "user",
      });

      expect(result.login).toBe("newlogin");
      expect(result.groups).toEqual([]);
      expect(result.id).toBeDefined();
    });
  });

  it("throws AlreadyExistsConflictError for a duplicate login", async () => {
    await withTestTx(async (tx) => {
      await insertTestUser(tx, { login: "duplicate-login" });

      await expect(
        createUser(tx, {
          login: "duplicate-login",
          password: "hashed",
          name: "Another User",
          email: null,
          accessLevel: "user",
        })
      ).rejects.toThrow(AlreadyExistsConflictError);
    });
  });
});

describe("updateUser", () => {
  it("updates and returns the user with their groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group.id, { role: "viewer" });

      const result = await updateUser(tx, {
        id: user.id,
        data: { login: user.login, name: "Renamed", email: user.email, accessLevel: "user" },
      });

      expect(result?.name).toBe("Renamed");
      expect(result?.groups).toEqual([{ id: group.id, role: "viewer" }]);
    });
  });

  it("returns null when the user does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await updateUser(tx, {
        id: "00000000-0000-0000-0000-000000000000",
        data: { login: "x", name: "x", email: null, accessLevel: "user" },
      });
      expect(result).toBeNull();
    });
  });
});

describe("deleteUser", () => {
  it("removes the user", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await deleteUser(tx, { id: user.id });

      const result = await getUserById(tx, { id: user.id });
      expect(result).toBeNull();
    });
  });
});

describe("getUsers", () => {
  it("returns all users with their groups", async () => {
    await withTestTx(async (tx) => {
      const user1 = await insertTestUser(tx);
      const user2 = await insertTestUser(tx);
      const group = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user1.id, group.id, { role: "supervisor" });

      const result = await getUsers(tx);
      const ids = result.map((u) => u.id);
      expect(ids).toContain(user1.id);
      expect(ids).toContain(user2.id);

      const foundUser1 = result.find((u) => u.id === user1.id);
      expect(foundUser1?.groups).toEqual([{ id: group.id, role: "supervisor" }]);
    });
  });
});

describe("getUserById", () => {
  it("returns the user with their groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const result = await getUserById(tx, { id: user.id });
      expect(result?.login).toBe(user.login);
      expect(result?.groups).toEqual([]);
    });
  });

  it("returns null when the user does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await getUserById(tx, { id: "00000000-0000-0000-0000-000000000000" });
      expect(result).toBeNull();
    });
  });
});

describe("updatePassword", () => {
  it("updates the password and returns the user", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx, { password: "old-hash" });
      const result = await updatePassword(tx, { id: user.id, data: { password: "new-hash" } });
      expect(result?.id).toBe(user.id);
    });
  });

  it("returns null when the user does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await updatePassword(tx, {
        id: "00000000-0000-0000-0000-000000000000",
        data: { password: "new-hash" },
      });
      expect(result).toBeNull();
    });
  });
});

describe("getUserByLogin", () => {
  it("returns the user with their groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx, { login: "findme" });
      const result = await getUserByLogin(tx, "findme");
      expect(result?.id).toBe(user.id);
      expect(result?.groups).toEqual([]);
    });
  });

  it("returns null when no user has that login", async () => {
    await withTestTx(async (tx) => {
      const result = await getUserByLogin(tx, "nobody-with-this-login");
      expect(result).toBeNull();
    });
  });
});

describe("getGroupsForUser", () => {
  it("returns the groups the user belongs to", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const group1 = await insertTestGroup(tx);
      const group2 = await insertTestGroup(tx);
      const otherGroup = await insertTestGroup(tx);
      await insertTestUserGroup(tx, user.id, group1.id);
      await insertTestUserGroup(tx, user.id, group2.id);

      const result = await getGroupsForUser(tx, { id: user.id });
      const ids = result.map((g) => g.id);
      expect(ids).toContain(group1.id);
      expect(ids).toContain(group2.id);
      expect(ids).not.toContain(otherGroup.id);
    });
  });

  it("returns an empty array when the user has no groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      const result = await getGroupsForUser(tx, { id: user.id });
      expect(result).toEqual([]);
    });
  });
});

describe("updateUserDisabledStatus", () => {
  it("updates the disabled flag and returns the user with groups", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx, { disabled: false });
      const result = await updateUserDisabledStatus(tx, { id: user.id, data: { disabled: true } });
      expect(result?.disabled).toBe(true);
      expect(result?.groups).toEqual([]);
    });
  });

  it("returns null when the user does not exist", async () => {
    await withTestTx(async (tx) => {
      const result = await updateUserDisabledStatus(tx, {
        id: "00000000-0000-0000-0000-000000000000",
        data: { disabled: true },
      });
      expect(result).toBeNull();
    });
  });
});
