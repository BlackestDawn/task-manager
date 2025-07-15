import type { TaskItem } from '@task-manager/common';

export function isOverdue(task: TaskItem): boolean {
  if (!task.finishBy) return false;
  const today = new Date();
  return task.finishBy < today && !task.completed;
}

export function isThisWeek(task: TaskItem): boolean {
  if (!task.finishBy) return false;
  const date = new Date(task.finishBy);
  const today = new Date();
  const firstOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
  const lastOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
  return date >= firstOfWeek && date <= lastOfWeek;
}

export function isThisMonth(task: TaskItem): boolean {
  if (!task.finishBy) return false;
  const date = new Date(task.finishBy);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

export function isFutureTask(task: TaskItem): boolean {
  if (!task.finishBy) return true;
  const today = new Date();
  const future = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return task.finishBy >= future;
}


export function sortByFinishDate(a: TaskItem, b: TaskItem): number {
  if (!a.finishBy) return 1;
  if (!b.finishBy) return -1;
  const dateA = new Date(a.finishBy);
  const dateB = new Date(b.finishBy);
  return dateA.getTime() - dateB.getTime();
}

export function elementNullCheck<T extends HTMLElement>(selector: string, searchStart?: HTMLElement): T {
  const el = (searchStart || document).querySelector<T>(selector);
  if (!el) throw new Error(`${selector} not found.`);
  return el;
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function justDate(date: Date | string): string {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0] || '';
  if (date instanceof Date) return date.toISOString().split('T')[0] || '';
  return new Date(date).toLocaleDateString();
}
