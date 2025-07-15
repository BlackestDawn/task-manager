import { envOrDefault, envOrThrow } from "@task-manager/common";
import { newDBConn } from "./db";

const portNum = parseInt(envOrDefault("PORT", "3000"));
const dbURL = envOrThrow("DB_URL");
const dbConn = newDBConn(dbURL);

export type Platform = "dev" | "prod";
export type DBConn = typeof dbConn;

export type ApiConfig = {
  port: number;
  platform: Platform;
  db: DBConn;
};

export const cfg: ApiConfig = {
  port: isNaN(portNum) ? 3000 : portNum,
  platform: envOrThrow("PLATFORM") as Platform,
  db: dbConn,
};