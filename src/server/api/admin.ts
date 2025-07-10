import { ApiConfig } from "../config";
import { respondWithJSON } from "../api/json";
import { UserForbiddenError } from "./errors";
import { reset } from "../db/db";

export async function handlerResetDb(cfg: ApiConfig, _: Request) {
  if (cfg.platform !== "dev") {
    throw new UserForbiddenError("This endpoint is only available in development mode");
  }

  reset(cfg.db);
  return respondWithJSON(200, { message: "Database reset successfully" });
}
