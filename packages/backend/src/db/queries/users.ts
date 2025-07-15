import { eq } from "drizzle-orm";
import { type DBConn } from "../../config";
import { users } from "../schema";
import type { User, CreateUserRequest, UpdateUserRequest } from "@task-manager/common";

export async function createUser(db: DBConn, params: CreateUserRequest) {
  const [result] = await db.insert(users).values({
    name: params.name,
  }).returning();
  return result as User;
}

export async function updateUser(db: DBConn, params: UpdateUserRequest) {
  const [result] = await db.update(users).set({
    name: params.name,
  }).where(eq(users.id, params.id)).returning();
  return result as User;
}

export async function deleteUser(db: DBConn, id: string) {
  const [result] = await db.delete(users).where(eq(users.id, id)).returning();
  return result as User;
}

export async function getUsers(db: DBConn) {
  const result = await db.select().from(users);
  return result as User[];
}

export async function getUserById(db: DBConn, id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result as User;
}
