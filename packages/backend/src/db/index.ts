import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import type { DBConn } from "../config";
import { seedInitialAdminUser } from "./seed";

export function newDBConn(url: string) {
  const conn = postgres(url);
  return drizzle(conn, { schema });
}

export async function runMigrations(db: DBConn) {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('Migrations completed successfully!');
    await seedInitialAdminUser(db);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

export async function closeConnection(db: DBConn) {
  // await db.$disconnect();
}
