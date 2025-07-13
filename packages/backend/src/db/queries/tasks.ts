import { eq } from "drizzle-orm";
import { type DBConn } from "../../config";
import type { TaskItem, CreateTaskRequest, UpdateTaskRequest } from "@task-manager/common";
import { tasks } from "../schema";

export async function createTask(db: DBConn, params: CreateTaskRequest) {
  const [result] = await db.insert(tasks).values({
    title: params.title,
    description: params.description,
    finishBy: params.finishBy,
    }).returning();
  return result as TaskItem;
}

export async function updateTask(db: DBConn, params: UpdateTaskRequest) {
  const [result] = await db.update(tasks).set({
    title: params.title,
    description: params.description,
    finishBy: params.finishBy,
  }).where(eq(tasks.id, params.id)).returning();
  return result as TaskItem;
}

export async function deleteTask(db: DBConn, id: string) {
  const [result] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
  return result as TaskItem;
}

export async function getTasks(db: DBConn) {
  const result = await db.select().from(tasks);
  return result as TaskItem[];
}

export async function getTaskById(db: DBConn, id: string) {
  const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
  return result as TaskItem;
}

export async function markDone(db: DBConn, id: string) {
  const [result] = await db.update(tasks).set({
    completed: true,
    completedAt: new Date()
  }).where(eq(tasks.id, id)).returning();
  return result as TaskItem;
}
