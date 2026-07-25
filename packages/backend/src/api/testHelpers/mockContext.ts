import type { Context } from "hono";

export function makeContext(opts: {
  get?: Record<string, unknown>;
  jsonBody?: unknown;
  param?: Record<string, string | undefined>;
} = {}): Context {
  const store: Record<string, unknown> = { config: { db: {} }, ...opts.get };
  return {
    get: (key: string) => store[key],
    set: (key: string, value: unknown) => {
      store[key] = value;
    },
    req: {
      json: async () => opts.jsonBody,
      param: (key: string) => opts.param?.[key],
    },
    json: (data: unknown, status?: number) => ({ __kind: "json", data, status: status ?? 200 }),
    body: (data: unknown, status?: number) => ({ __kind: "body", data, status }),
  } as unknown as Context;
}
