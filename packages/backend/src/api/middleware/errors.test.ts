import { describe, it, expect, afterEach } from "vitest";
import type { Context } from "hono";
import { errorHandlingMiddleware } from "./errors";
import { cfg } from "../../config";
import { BadRequestError, UserForbiddenError } from "@task-manager/common";

const originalPlatform = cfg.platform;
afterEach(() => {
  cfg.platform = originalPlatform;
});

function makeContext() {
  const store: Record<string, unknown> = { requestId: "req-123" };
  const c = {
    get: (key: string) => store[key],
    req: { path: "/api/tasks", method: "GET" },
    json: (data: unknown, status?: number) => ({ __kind: "json", data, status }),
  } as unknown as Context;
  return c;
}

describe("errorHandlingMiddleware", () => {
  it("uses the error's own status code and message for HTTPErrors subtypes", () => {
    const c = makeContext();
    const result = errorHandlingMiddleware(new BadRequestError("bad input"), c) as any;

    expect(result.status).toBe(400);
    expect(result.data.error).toBe("bad input");
    expect(result.data.requestId).toBe("req-123");
    expect(result.data.timestamp).toBeDefined();
  });

  it("uses a different HTTPErrors subtype's own status code", () => {
    const c = makeContext();
    const result = errorHandlingMiddleware(new UserForbiddenError("nope"), c) as any;

    expect(result.status).toBe(403);
    expect(result.data.error).toBe("nope");
  });

  it("hides the real message behind a generic one for a plain Error in prod", () => {
    cfg.platform = "prod";
    const c = makeContext();
    const result = errorHandlingMiddleware(new Error("db connection string leaked here"), c) as any;

    expect(result.status).toBe(500);
    expect(result.data.error).toBe("something went wrong on our end");
  });

  it("exposes the real message for a plain Error in dev", () => {
    cfg.platform = "dev";
    const c = makeContext();
    const result = errorHandlingMiddleware(new Error("exact failure reason"), c) as any;

    expect(result.status).toBe(500);
    expect(result.data.error).toBe("exact failure reason");
  });

  it("reports an unknown error shape generically even in dev", () => {
    cfg.platform = "dev";
    const c = makeContext();
    const result = errorHandlingMiddleware("just a string, not an Error" as any, c) as any;

    expect(result.status).toBe(500);
    expect(result.data.error).toBe("just a string, not an Error");
  });

  it("falls back to 'An unknown error occurred' for a non-Error, non-string throw in dev", () => {
    cfg.platform = "dev";
    const c = makeContext();
    const result = errorHandlingMiddleware({ weird: "object" } as any, c) as any;

    expect(result.data.error).toBe("An unknown error occurred");
  });
});
