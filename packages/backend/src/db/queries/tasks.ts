import { eq, sql } from "drizzle-orm";
import { type DBConn } from "../../config";
import type { CreateTaskRequest, UpdateTaskRequest, DoByUUIDRequest } from "@task-manager/common";
import { tasks } from "../schema";

export async function createTask(db: DBConn, params: CreateTaskRequest) {
  const [result] = await db.insert(tasks).values(params).returning();
  return result;
}

export async function updateTask(db: DBConn, params: UpdateTaskRequest) {
  const [result] = await db.update(tasks).set(params).where(eq(tasks.id, params.id)).returning();
  return result;
}

export async function deleteTask(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.delete(tasks).where(eq(tasks.id, params.id)).returning();
  return result;
}

export async function getAllTasks(db: DBConn) {
  const result = await db.select().from(tasks);
  return result;
}

export async function getTaskById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(tasks).where(eq(tasks.id, params.id));
  return result;
}

export async function markDone(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.update(tasks).set({
    completed: true,
    completedAt: sql`now()`
  }).where(eq(tasks.id, params.id)).returning();
  return result;
}

export async function getTasksByUserId(db: DBConn, params: DoByUUIDRequest) {
  const result = await db.select().from(tasks).where(eq(tasks.userId, params.id));
  return result;
}
