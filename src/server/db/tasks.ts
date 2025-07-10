import { Database } from "bun:sqlite";
import type { TaskItem, TaskItemCreateRequest, TaskItemUpdateRequest } from "./types";
import { randomUUIDv7 } from "bun";

export function createTask(db: Database, params: TaskItemCreateRequest) {
  const newID = randomUUIDv7();
  const sql = `
    INSERT INTO tasks (id, created_at, title, completed, finish_by)
    VALUES (?, CURRENT_TIMESTAMP, ?, 0, ?)
  `;
  if (!params.finish_by) {
    params.finish_by = "NULL";
  }
  db.run(sql, [newID,params.title, params.finish_by]);
  const result = getTaskById(db, newID) as TaskItem;
  return result;
}

export function updateTask(db: Database, params: TaskItemUpdateRequest) {
  const sql = `
    UPDATE tasks
    SET title = ?, finish_by = ?
    WHERE id = ?
  `;
  const currentItem = getTaskById(db, params.id) as TaskItem;
  if (!currentItem) {
    throw new Error("Task item not found");
  }
  if (!params.title) {
    params.title = currentItem.title;
  }
  if (!params.finish_by) {
    params.finish_by = currentItem.finish_by;
  }
  db.run(sql, [params.title, params.finish_by, params.id]);
  const updatedTask = getTaskById(db, params.id) as TaskItem;
  return updatedTask;
}

export function deleteTask(db: Database, id: string) {
  const sql = `
    DELETE FROM tasks
    WHERE id = ?
  `;
  db.run(sql, [id]);
}

export function getTasks(db: Database): TaskItem[] {
  const sql = `
    SELECT *
    FROM tasks
    ORDER BY created_at DESC
  `;
  return db.query(sql).all() as TaskItem[];
}

export function getTaskById(db: Database, id: string): TaskItem | undefined {
  const sql = `
    SELECT *
    FROM tasks
    WHERE id = ?
  `;
  return db.query(sql).get(id) as TaskItem | undefined;
}

export function markDone(db: Database, id: string) {
  const sql = `
    UPDATE tasks
    SET completed = 1, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(sql, [id]);
}
