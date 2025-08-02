export const getTZNormalizedDate = (offset?: number) => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000 + (offset || 0) * 1000);
}
