import { eq, and, inArray, sql, exists } from "drizzle-orm";
import { type DBConn } from "../../config";
import { groups, users, userGroups, tasks, taskGroups } from "../schema";
import type { Group, GroupWithStats, DoByUUIDRequest, CreateGroupRequest, UpdateGroupRequest, AddUserToGroupRequest, RemoveUserFromGroupRequest, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest } from "@task-manager/common";
import { getGroupRolesForUser } from "./users";
import { getGroupsForTask } from "./tasks";
import { AlreadyExistsConflictError } from "@task-manager/common";

export async function getGroupById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(groups).where(eq(groups.id, params.id));
  return {
    __typename: 'Group',
    ...result,
  };
}

export async function getGroups(db: DBConn, params?: DoByUUIDRequest) {
  let query = db.select({
    id: groups.id,
    name: groups.name,
    description: groups.description,
    createdAt: groups.createdAt,
    updatedAt: groups.updatedAt,
    userCount: sql<number>`(select count(*) from ${userGroups} where ${userGroups.groupId} = ${groups.id})`.as('userCount'),
    taskCount: sql<number>`(select count(*) from ${taskGroups} where ${taskGroups.groupId} = ${groups.id})`.as('taskCount'),
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

export async function updateGroup(db: DBConn, params: { id: string, data: UpdateGroupRequest}) {
  const [result] = await db.update(groups).set(params.data).where(eq(groups.id, params.id)).returning();
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

export async function removeUserFromGroup(db: DBConn, params: { id: string, data:RemoveUserFromGroupRequest}) {
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
      const groups = await getGroupRolesForUser(db, params);

      return {
        __typename: 'User',
        ...user,
        groups: groups,
      };
    })
  );

  return result;
}

export async function assignTaskToGroup(db: DBConn, params: { id: string, data: AssignTaskToGroupRequest}) {
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

export async function removeTaskFromGroup(db: DBConn, params: { id: string, data: RemoveTaskFromGroupRequest}) {
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
      const groups = await getGroupsForTask(db, params);

      return {
        __typename: 'Task',
        ...task,
        groups: groups,
      };
    })
  );

  return result;
}
