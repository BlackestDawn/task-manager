import { type Task } from '@task-manager/common';

export const getTZNormalizedDate = (offset?: number) => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000 + (offset || 0) * 1000);
}

export function justDate(date: Date | string): string {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0] || '';
  if (date instanceof Date) return date.toISOString().split('T')[0] || '';
  return new Date(date).toLocaleDateString();
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
  const firstOfWeek = new Date(today.getDate() - today.getDay() + 1);
  const lastOfWeek = new Date(today.getDate() - today.getDay() + 7);
  return testDate >= firstOfWeek && testDate <= lastOfWeek;
}

export function isThisMonth(date: string | Date | null): boolean {
  if (!date) return false;
  const testDate = new Date(date);
  const today = new Date();
  return testDate.getMonth() === today.getMonth() && testDate.getFullYear() === today.getFullYear();
}

export function isFutureTask(task: Task): boolean {
  if (!task.finishBy) return true;
  const today = new Date();
  const future = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return task.finishBy >= future;
}

export function sortTasksByFinishDate(a: Task, b: Task): number {
  if (!a.finishBy) return 1;
  if (!b.finishBy) return -1;
  const dateA = new Date(a.finishBy);
  const dateB = new Date(b.finishBy);
  return dateA.getTime() - dateB.getTime();
}

export function formatDate(date: Date) {
  const taskDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (taskDate.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (taskDate.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;

  return taskDate.toLocaleDateString();
}
