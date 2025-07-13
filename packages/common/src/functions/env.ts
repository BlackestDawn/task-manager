export function envOrThrow(key: string) {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error(`${key} must be set`);
  }
  return envVar;
}

export function envOrDefault(key: string, defaultValue: string) {
  return process.env[key] || defaultValue;
}
