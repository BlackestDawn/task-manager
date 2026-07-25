import { describe, it, expect, vi } from "vitest";
import type { Context } from "hono";
import { validateID } from "./helpers";

function makeContext(id: string | undefined) {
  const store: Record<string, unknown> = {};
  const c = {
    req: { param: (_key: string) => id },
    set: (key: string, value: unknown) => {
      store[key] = value;
    },
    get: (key: string) => store[key],
    json: (data: unknown, status?: number) => ({ __kind: "json", data, status }),
  } as unknown as Context;
  return { c, store };
}

describe("validateID", () => {
  it("sets recID and calls next for a valid UUID", async () => {
    const { c, store } = makeContext("123e4567-e89b-12d3-a456-426614174000");
    const next = vi.fn().mockResolvedValue(undefined);

    await validateID(c, next);

    expect(store.recID).toEqual({ id: "123e4567-e89b-12d3-a456-426614174000" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns a 400 and does not call next for an invalid id", async () => {
    const { c } = makeContext("not-a-uuid");
    const next = vi.fn().mockResolvedValue(undefined);

    const result = await validateID(c, next) as any;

    expect(result?.status).toBe(400);
    expect(result?.data).toEqual({ error: "Invalid ID in API path" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns a 400 for a missing id param", async () => {
    const { c } = makeContext(undefined);
    const next = vi.fn().mockResolvedValue(undefined);

    const result = await validateID(c, next) as any;

    expect(result?.status).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });
});
