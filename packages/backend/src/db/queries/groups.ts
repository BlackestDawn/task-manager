import { eq, and, exists } from "drizzle-orm";
import { type DBConn } from "../../config";
import { groups, userGroups, taskGroups, taskGroupsRelations, tasksRelations, usersRelations, groupsRelations } from "../schema";
import type { DoByUUIDRequest, CreateGroupRequest, UpdateGroupRequest, AddOrRemoveUserToGroupRequest, AssignOrRemoveTaskToGroupRequest } from "@task-manager/common";

export async function getGroupById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(groups).where(eq(groups.id, params.id));
  return result;
}

export async function getGroups(db: DBConn) {
  const result = await db.select().from(groups);
  return result;
}

export async function createGroup(db: DBConn, params: CreateGroupRequest) {
  const [result] = await db.insert(groups).values(params).returning();
  return result;
}

export async function updateGroup(db: DBConn, params: UpdateGroupRequest) {
  const [result] = await db.update(groups).set(params).where(eq(groups.id, params.id)).returning();
  return result;
}

export async function removeGroup(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.delete(groups).where(eq(groups.id, params.id)).returning();
  return result;
}
