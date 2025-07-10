import type { TaskItem } from './types';

export function isOverdue(task: TaskItem): boolean {
  if (!task.finish_by || task.finish_by === 'NULL') return false;
  const date = new Date(task.finish_by);
  const today = new Date();
  return date < today;
}

export function isThisWeek(task: TaskItem): boolean {
  if (!task.finish_by || task.finish_by === 'NULL') return false;
  const date = new Date(task.finish_by);
  const today = new Date();
  const firstOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
  const lastOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
  return date >= firstOfWeek && date <= lastOfWeek;
}

export function isThisMonth(task: TaskItem): boolean {
  if (!task.finish_by || task.finish_by === 'NULL') return false;
  const date = new Date(task.finish_by);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

export function dateSort(a: TaskItem, b: TaskItem): number {
  if (!a.finish_by || a.finish_by === 'NULL') return 1;
  if (!b.finish_by || b.finish_by === 'NULL') return -1;
  const dateA = new Date(a.finish_by);
  const dateB = new Date(b.finish_by);
  return dateA.getTime() - dateB.getTime();
}
