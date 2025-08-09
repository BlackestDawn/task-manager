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
  jwt: {
    secret: string;
    defaultExpireTime: number;
  };
  crypto: {
    salt_rounds: number;
    token_issuer: string;
  };
  refreashToken: {
    defaultExpireTime: number;
  };
};

export const cfg: ApiConfig = {
  port: isNaN(portNum) ? 3000 : portNum,
  platform: envOrThrow("PLATFORM") as Platform,
  db: dbConn,
  jwt: {
    secret: envOrThrow("JWT_SECRET"),
    defaultExpireTime: 3600,
  },
  crypto: {
    salt_rounds: 10,
    token_issuer: "taskies-manager",
  },
  refreashToken: {
    defaultExpireTime: 60 * 60 * 24 * 60,
  },
};
