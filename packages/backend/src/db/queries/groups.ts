import { eq, and, inArray } from "drizzle-orm";
import { type DBConn } from "../../config";
import { groups, users, userGroups, tasks, taskGroups } from "../schema";
import type { DoByUUIDRequest, CreateGroupRequest, UpdateGroupRequest, AddUserToGroupRequest, RemoveUserFromGroupRequest, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest } from "@task-manager/common";
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

export async function getGroups(db: DBConn) {
  const result = await db.select().from(groups);
  return result.map((group) => {
    return {
      __typename: 'Group',
      ...result,
    };
  });
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

export async function updateGroup(db: DBConn, params: UpdateGroupRequest) {
  const [result] = await db.update(groups).set(params).where(eq(groups.id, params.id)).returning();
  return {
    __typename: 'Group',
    ...result,
  };
}

export async function removeGroup(db: DBConn, params: DoByUUIDRequest) {
  await db.delete(groups).where(eq(groups.id, params.id)).returning();
}

export async function addUserToGroup(db: DBConn, params: AddUserToGroupRequest) {
  const existing = await db.select().from(userGroups).where(and(
    eq(userGroups.userId, params.userId),
    eq(userGroups.groupId, params.groupId),
  ));
  if (existing.length > 0) throw new AlreadyExistsConflictError("User already in group");
  const [result] = await db.insert(userGroups).values(params).returning();
  return {
    __typename: 'User',
    ...result,
  };
}

export async function removeUserFromGroup(db: DBConn, params: RemoveUserFromGroupRequest) {
  await db.delete(userGroups).where(and(
    eq(userGroups.userId, params.userId),
    eq(userGroups.groupId, params.groupId),
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

export async function assignTaskToGroup(db: DBConn, params: AssignTaskToGroupRequest) {
  const existing = await db.select().from(taskGroups).where(and(
    eq(taskGroups.taskId, params.taskId),
    eq(taskGroups.groupId, params.groupId),
  ));
  if (existing.length > 0) throw new AlreadyExistsConflictError("Task already in group");
  const [result] = await db.insert(taskGroups).values(params).returning();
  return result;
}

export async function removeTaskFromGroup(db: DBConn, params: RemoveTaskFromGroupRequest) {
  await db.delete(taskGroups).where(and(
    eq(taskGroups.taskId, params.taskId),
    eq(taskGroups.groupId, params.groupId),
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
