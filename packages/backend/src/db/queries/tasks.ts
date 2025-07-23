import { eq } from "drizzle-orm";
import { type DBConn } from "../../config";
import type { TaskItem, CreateTaskRequest, UpdateTaskRequest, GetTasksRequest, DoByUUIDRequest } from "@task-manager/common";
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

export async function getTasks(db: DBConn) {
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
    completedAt: new Date()
  }).where(eq(tasks.id, params.id)).returning();
  return result;
}

export async function getTasksByUserId(db: DBConn, params: GetTasksRequest) {
  const result = await db.select().from(tasks).where(eq(tasks.userId, params.userId));
  return result;
}
