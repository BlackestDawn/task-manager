import type { Task } from '../types/tasks';

export const getTZNormalizedDate = (offset?: number) => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000 + (offset || 0) * 1000);
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.finishBy) return false;
  const taskDate = new Date(task.finishBy);
  taskDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taskDate < today && !task.completed;
}

export function isThisWeek(date: string | Date | null): boolean {
  if (!date) return false;
  const testDate = new Date(date);
  testDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Monday-start week. getDay() is 0 (Sun) - 6 (Sat); this maps Monday to 0.
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const firstOfWeek = new Date(today);
  firstOfWeek.setDate(today.getDate() - daysSinceMonday);
  const lastOfWeek = new Date(firstOfWeek);
  lastOfWeek.setDate(firstOfWeek.getDate() + 6);
  return testDate >= firstOfWeek && testDate <= lastOfWeek;
}

export function isThisMonth(date: string | Date | null): boolean {
  if (!date) return false;
  const testDate = new Date(date);
  const today = new Date();
  return testDate.getMonth() === today.getMonth() && testDate.getFullYear() === today.getFullYear();
}

export function sortTasksByFinishDate(a: Task, b: Task): number {
  if (!a.finishBy) return 1;
  if (!b.finishBy) return -1;
  const dateA = new Date(a.finishBy);
  const dateB = new Date(b.finishBy);
  return dateA.getTime() - dateB.getTime();
}
