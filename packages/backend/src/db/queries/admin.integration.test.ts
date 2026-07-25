import { describe, it, expect } from "vitest";
import { withTestTx } from "../testHelpers/testDb";
import { insertTestUser, insertTestGroup, insertTestTask } from "../testHelpers/fixtures";
import { resetDb } from "./admin";
import { getUsers } from "./users";
import { getGroups } from "./groups";
import { getAllTasks } from "./tasks";
import { registerRefreashToken, getRefreshTokenByToken } from "./auth";

describe("resetDb", () => {
  it("wipes all users, groups, tasks, and refresh tokens", async () => {
    await withTestTx(async (tx) => {
      const user = await insertTestUser(tx);
      await insertTestGroup(tx);
      await insertTestTask(tx, user.id);
      await registerRefreashToken(tx, {
        token: "a-token",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      });

      await resetDb(tx);

      expect(await getGroups(tx)).toEqual([]);
      expect(await getAllTasks(tx)).toEqual([]);
      expect(await getRefreshTokenByToken(tx, { token: "a-token" })).toBeUndefined();
    });
  });

  it("reseeds exactly one admin user", async () => {
    await withTestTx(async (tx) => {
      await insertTestUser(tx);
      await insertTestUser(tx);

      await resetDb(tx);

      const users = await getUsers(tx);
      expect(users).toHaveLength(1);
      expect(users[0]!.login).toBe("admin");
      expect(users[0]!.accessLevel).toBe("admin");
    });
  });

  it("does not duplicate the admin user when the database is already empty", async () => {
    await withTestTx(async (tx) => {
      await resetDb(tx);
      const users = await getUsers(tx);
      expect(users).toHaveLength(1);
      expect(users[0]!.login).toBe("admin");
    });
  });
});
