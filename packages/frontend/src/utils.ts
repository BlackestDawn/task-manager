import type { TaskItem } from '@task-manager/common';

export function isOverdue(task: TaskItem): boolean {
  if (!task.finishBy) return false;
  const date = new Date(task.finishBy);
  const today = new Date();
  return date < today;
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

export function dateSort(a: TaskItem, b: TaskItem): number {
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
