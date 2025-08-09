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
