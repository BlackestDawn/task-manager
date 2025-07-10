import { Database } from "bun:sqlite";

export function newDatabase(pathToDb: string): Database {
  const db = new Database(pathToDb);
  autoMigrate(db);
  return db;
}

export function autoMigrate(db: Database): void {
  const taskTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      created_at DATE DEFAULT CURRENT_TIMESTAMP,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      finish_by DATE,
      completed_at DATE
    )
  `;
  db.run(taskTable);
}

export function reset(db: Database): void {
  db.run("DELETE FROM tasks");
}
