import { eq, inArray, and, or } from "drizzle-orm";
import { type DBConn } from "../../config";
import { users, groups, userGroups } from "../schema";
import type { CreateUserRequest, UpdateUserRequest, UpdatePasswordRequest, DoByUUIDRequest, disabledUserRequest } from "@task-manager/common";
import { AlreadyExistsConflictError } from "@task-manager/common";

export async function getGroupRolesForUser(db: DBConn, params: DoByUUIDRequest) {
  const result = await db.select({
    id: userGroups.groupId,
    role: userGroups.role,
  }).from(userGroups).where(eq(userGroups.userId, params.id));
  return result;
}

export async function createUser(db: DBConn, params: CreateUserRequest) {
  const existing = await db.select().from(users).where(eq(users.login, params.login));
  if (existing.length > 0) throw new AlreadyExistsConflictError("User already exists");
  const [result] = await db.insert(users).values(params).returning();
  return {
    __typename: 'User',
    ...result,
    groups: [],
  };
}

export async function updateUser(db: DBConn, params: UpdateUserRequest) {
  const [result] = await db.update(users).set(params).where(eq(users.id, params.id)).returning();
  if (!result) return null;
  const groups = await getGroupRolesForUser(db, params);

  return {
    __typename: 'User',
    ...result,
    groups: groups,
  };
}

export async function deleteUser(db: DBConn, params: DoByUUIDRequest) {
  await db.delete(users).where(eq(users.id, params.id)).returning();
}

export async function getUsers(db: DBConn) {
  const userRows = await db.select().from(users);
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

export async function getUserById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(users).where(eq(users.id, params.id));
  if (!result) return null;
  const groups = await getGroupRolesForUser(db, params);

  return {
    __typename: 'User',
    ...result,
    groups: groups,
  };
}

export async function updatePassword(db: DBConn, params: UpdatePasswordRequest) {
  const [result] = await db.update(users).set(params).where(eq(users.id, params.id)).returning();
  if (!result) return null;
  const groups = await getGroupRolesForUser(db, params);

  return {
    __typename: 'User',
    ...result,
    groups: groups,
  };
}

export async function getUserByLogin(db: DBConn, login: string) {
  const [result] = await db.select().from(users).where(eq(users.login, login));
  if (!result) return null;
  const groups = await getGroupRolesForUser(db, { id: result.id });

  return {
    __typename: 'User',
    ...result,
    groups: groups,
  };
}

export async function getGroupsForUser(db: DBConn, params: DoByUUIDRequest) {
  const result = await db.select().from(groups)
    .where(inArray(
      groups.id,
      db.select({
        groupId: userGroups.id
      }).from(userGroups).where(eq(userGroups.userId, params.id))
    ));
  return result;
}

export async function disabledUser(db: DBConn, params: disabledUserRequest) {
  const [result] = await db.update(users).set({
    disabled: params.disabled,
  }).where(eq(users.id, params.id)).returning();
  if (!result) return null;
  const groups = await getGroupRolesForUser(db, params);

  return {
    __typename: 'User',
    ...result,
    groups: groups,
  };
}
