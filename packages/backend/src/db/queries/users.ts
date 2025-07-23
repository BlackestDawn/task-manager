import { eq } from "drizzle-orm";
import { type DBConn } from "../../config";
import { users } from "../schema";
import type { CreateUserRequest, UpdateUserRequest, UpdatePasswordRequest, DoByUUIDRequest } from "@task-manager/common";

export async function createUser(db: DBConn, params: CreateUserRequest) {
  const [result] = await db.insert(users).values(params).returning();
  return result;
}

export async function updateUser(db: DBConn, params: UpdateUserRequest) {
  const [result] = await db.update(users).set(params).where(eq(users.id, params.id)).returning();
  return result;
}

export async function deleteUser(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.delete(users).where(eq(users.id, params.id)).returning();
  return result;
}

export async function getUsers(db: DBConn) {
  const result = await db.select().from(users);
  return result;
}

export async function getUserById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(users).where(eq(users.id, params.id));
  return result;
}

export async function updatePassword(db: DBConn, params: UpdatePasswordRequest) {
  const [result] = await db.update(users).set(params).where(eq(users.id, params.id)).returning();
  return result;
}

export async function getUserByLogin(db: DBConn, login: string) {
  const [result] = await db.select().from(users).where(eq(users.login, login));
  return result;
}
