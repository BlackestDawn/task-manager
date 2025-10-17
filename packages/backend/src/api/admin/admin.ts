import type { Context } from "hono";
import { type ApiConfig } from "../../config";
import { UserForbiddenError } from "@task-manager/common";
import { resetDb } from "../../db/queries/admin";

export async function handlerResetDb(c: Context) {
  const cfg = c.get("config") as ApiConfig;
  if (cfg.platform !== "dev") {
    throw new UserForbiddenError("This endpoint is only available in development mode");
  }

  resetDb(cfg.db);
  return c.json({ message: "Database reset successfully" });
}
