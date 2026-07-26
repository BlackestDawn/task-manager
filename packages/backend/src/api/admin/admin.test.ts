import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlerResetDb } from "./admin";
import { resetDb } from "../../db/queries/admin";
import { makeContext } from "../testHelpers/mockContext";

vi.mock("../../db/queries/admin", () => ({
  resetDb: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(resetDb).mockReset();
});

describe("handlerResetDb", () => {
  it("resets the database and returns a success message in dev mode", async () => {
    vi.mocked(resetDb).mockResolvedValue(undefined);

    const c = makeContext({ get: { config: { db: {}, platform: "dev" } } });
    const result = await handlerResetDb(c) as any;

    expect(resetDb).toHaveBeenCalledTimes(1);
    expect(result.data.message).toBe("Database reset successfully");
  });

  it("rejects the request outside of dev mode", async () => {
    const c = makeContext({ get: { config: { db: {}, platform: "prod" } } });

    await expect(handlerResetDb(c)).rejects.toThrow(
      "This endpoint is only available in development mode"
    );
    expect(resetDb).not.toHaveBeenCalled();
  });

  it("propagates a failure from resetDb instead of reporting success", async () => {
    // Regression guard: resetDb must actually be awaited — previously it
    // was fire-and-forget, so a rejection here would have become an
    // unhandled promise rejection instead of failing the request.
    vi.mocked(resetDb).mockRejectedValue(new Error("reset failed"));

    const c = makeContext({ get: { config: { db: {}, platform: "dev" } } });

    await expect(handlerResetDb(c)).rejects.toThrow("reset failed");
  });
});
