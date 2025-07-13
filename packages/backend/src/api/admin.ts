import { type ApiConfig } from "../config";
import { respondWithJSON } from "../utils/response";
import { UserForbiddenError } from "@task-manager/common";
import { resetDb } from "../db/queries/admin";

export async function handlerResetDb(cfg: ApiConfig, _: Request) {
  if (cfg.platform !== "dev") {
    throw new UserForbiddenError("This endpoint is only available in development mode");
  }

  resetDb(cfg.db);
  return respondWithJSON(200, { message: "Database reset successfully" });
}
