import { newDatabase } from "./db/db";
import type { Database } from "bun:sqlite";

export type ApiConfig = {
  db: Database;
  platform: PlatformType;
  port: number;
};

export type PlatformType = "dev" | "prod";

const db = newDatabase("./app.db");
const portNum = parseInt(envOrThrow("PORT"));

export const cfg: ApiConfig = {
  db,
  platform: envOrThrow("PLATFORM") as PlatformType,
  port: isNaN(portNum) ? 3000 : portNum,
};

function envOrThrow(key: string) {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error(`${key} must be set`);
  }
  return envVar;
}
