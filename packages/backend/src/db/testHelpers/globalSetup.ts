import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { envOrThrow } from "@task-manager/common";

export default async function setup() {
  const conn = postgres(envOrThrow("DB_URL"), { max: 1 });
  const db = drizzle(conn);
  await migrate(db, {
    migrationsFolder: path.resolve(import.meta.dirname, "../migrations"),
  });
  await conn.end();
}
