import { eq, and, inArray, sql, count } from "drizzle-orm";
import { type DBConn } from "../../config";
import { groups, users, userGroups, tasks, taskGroups } from "../schema";
import type { DoByUUIDRequest, CreateGroupRequest, UpdateGroupRequest, AddUserToGroupRequest, RemoveUserFromGroupRequest, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest } from "@task-manager/common";
import { getGroupRolesForUser } from "./users";
import { getGroupsForTask } from "./tasks";
import { AlreadyExistsConflictError } from "@task-manager/common";

export async function getGroupById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(groups).where(eq(groups.id, params.id));
  if (!result) return null;
  return {
    __typename: 'Group',
    ...result,
  };
}

export async function getGroups(db: DBConn, params?: DoByUUIDRequest) {
  // Raw sql`...` template interpolation of column references doesn't
  // qualify them by table, so a plain `${groups.id}` inside a subquery
  // whose FROM table has its own `id` column (user_groups, task_groups)
  // silently resolves to that inner column instead — correlate via the
  // query builder instead so drizzle qualifies everything correctly.
  const userCountSubquery = db.select({ value: count() }).from(userGroups).where(eq(userGroups.groupId, groups.id));
  const taskCountSubquery = db.select({ value: count() }).from(taskGroups).where(eq(taskGroups.groupId, groups.id));

  let query = db.select({
    id: groups.id,
    name: groups.name,
    description: groups.description,
    createdAt: groups.createdAt,
    updatedAt: groups.updatedAt,
    // count(*) is bigint, which postgres.js returns as a string to avoid
    // precision loss — cast to int32 (group/task counts are always small)
    // so callers actually get a JS number, matching the sql<number> type.
    userCount: sql<number>`(${userCountSubquery})::int`.as('userCount'),
    taskCount: sql<number>`(${taskCountSubquery})::int`.as('taskCount'),
  }).from(groups);

  /*   if (params?.id) {
      query = query.where(
        exists(
          db.select({ one: sql`1` })
            .from(userGroups)
            .where(and(
              eq(userGroups.userId, params.id),
              eq(userGroups.groupId, groups.id)
            ))
        )
      );
    } */

  const result = await query;
  return result.map(group => ({
    __typename: 'Group',
    ...group,
  }));
}

export async function createGroup(db: DBConn, params: CreateGroupRequest) {
  const existing = await db.select().from(groups).where(eq(groups.name, params.name));
  if (existing.length > 0) throw new AlreadyExistsConflictError("Group already exists");
  const [result] = await db.insert(groups).values(params).returning();
  return {
    __typename: 'Group',
    ...result,
  };
}

export async function updateGroup(db: DBConn, params: { id: string, data: UpdateGroupRequest }) {
  const [result] = await db.update(groups).set(params.data).where(eq(groups.id, params.id)).returning();
  if (!result) return null;
  return {
    __typename: 'Group',
    ...result,
  };
}

export async function removeGroup(db: DBConn, params: DoByUUIDRequest) {
  await db.delete(groups).where(eq(groups.id, params.id)).returning();
}

export async function addUserToGroup(db: DBConn, params: { id: string, data: AddUserToGroupRequest }) {
  const existing = await db.select().from(userGroups).where(and(
    eq(userGroups.userId, params.data.userId),
    eq(userGroups.groupId, params.id),
  ));
  if (existing.length > 0) throw new AlreadyExistsConflictError("User already in group");
  const [result] = await db.insert(userGroups).values({
    groupId: params.id,
    ...params.data,
  }).returning();
  return {
    __typename: 'User',
    ...result,
  };
}

export async function removeUserFromGroup(db: DBConn, params: { id: string, data: RemoveUserFromGroupRequest }) {
  await db.delete(userGroups).where(and(
    eq(userGroups.userId, params.data.userId),
    eq(userGroups.groupId, params.id),
  ));
}

export async function getGroupMembers(db: DBConn, params: DoByUUIDRequest) {
  const userRows = await db.select().from(users)
    .where(inArray(
      users.id,
      db.select({
        userId: userGroups.userId,
      }).from(userGroups)
        .where(eq(userGroups.groupId, params.id))
    ));
  const result = await Promise.all(
    userRows.map(async (user) => {
      const groups = await getGroupRolesForUser(db, { id: user.id });

      return {
        __typename: 'User',
        ...user,
        groups: groups,
      };
    })
  );

  return result;
}

export async function assignTaskToGroup(db: DBConn, params: { id: string, data: AssignTaskToGroupRequest }) {
  const existing = await db.select().from(taskGroups).where(and(
    eq(taskGroups.taskId, params.data.taskId),
    eq(taskGroups.groupId, params.id),
  ));
  if (existing.length > 0) throw new AlreadyExistsConflictError("Task already in group");
  const [result] = await db.insert(taskGroups).values({
    groupId: params.id,
    ...params.data,
  }).returning();
  return result;
}

export async function removeTaskFromGroup(db: DBConn, params: { id: string, data: RemoveTaskFromGroupRequest }) {
  await db.delete(taskGroups).where(and(
    eq(taskGroups.taskId, params.data.taskId),
    eq(taskGroups.groupId, params.id),
  ));
}

export async function getGroupTasks(db: DBConn, params: DoByUUIDRequest) {
  const taskRows = await db.select().from(tasks)
    .where(inArray(
      tasks.id,
      db.select({
        taskId: taskGroups.taskId,
      }).from(taskGroups)
        .where(eq(taskGroups.groupId, params.id))
    ));
  const result = await Promise.all(
    taskRows.map(async (task) => {
      const groups = await getGroupsForTask(db, { id: task.id });

      return {
        __typename: 'Task',
        ...task,
        groups: groups,
      };
    })
  );

  return result;
}
