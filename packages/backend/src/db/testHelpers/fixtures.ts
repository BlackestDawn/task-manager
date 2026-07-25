import { users, groups, tasks, userGroups, taskGroups } from "../schema";
import type { DBConn } from "../../config";

let counter = 0;
function unique(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export async function insertTestUser(tx: DBConn, overrides: Partial<typeof users.$inferInsert> = {}) {
  const [user] = await tx.insert(users).values({
    login: unique("user"),
    name: "Test User",
    password: "hashed-password",
    email: `${unique("user")}@example.com`,
    disabled: false,
    accessLevel: "user",
    ...overrides,
  }).returning();
  return user!;
}

export async function insertTestGroup(tx: DBConn, overrides: Partial<typeof groups.$inferInsert> = {}) {
  const [group] = await tx.insert(groups).values({
    name: unique("group"),
    description: null,
    ...overrides,
  }).returning();
  return group!;
}

export async function insertTestTask(tx: DBConn, userId: string, overrides: Partial<typeof tasks.$inferInsert> = {}) {
  const [task] = await tx.insert(tasks).values({
    title: unique("task"),
    userId,
    completed: false,
    ...overrides,
  }).returning();
  return task!;
}

export async function insertTestUserGroup(
  tx: DBConn,
  userId: string,
  groupId: string,
  overrides: Partial<typeof userGroups.$inferInsert> = {}
) {
  const [row] = await tx.insert(userGroups).values({
    userId,
    groupId,
    role: "user",
    ...overrides,
  }).returning();
  return row!;
}

export async function insertTestTaskGroup(
  tx: DBConn,
  taskId: string,
  groupId: string,
  overrides: Partial<typeof taskGroups.$inferInsert> = {}
) {
  const [row] = await tx.insert(taskGroups).values({
    taskId,
    groupId,
    ...overrides,
  }).returning();
  return row!;
}
