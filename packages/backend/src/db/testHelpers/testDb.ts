import { newDBConn } from "../index";
import { envOrThrow } from "@task-manager/common";
import type { DBConn } from "../../config";

export const testDb: DBConn = newDBConn(envOrThrow("DB_URL"));

class RollbackTestTransaction extends Error {}

// Runs `fn` inside a transaction that's always rolled back afterwards, so
// each test gets a clean, isolated view of the schema without needing
// manual truncate/reset between tests.
export async function withTestTx(fn: (tx: DBConn) => Promise<void>): Promise<void> {
  try {
    await testDb.transaction(async (tx) => {
      await fn(tx as unknown as DBConn);
      throw new RollbackTestTransaction();
    });
  } catch (err) {
    if (err instanceof RollbackTestTransaction) return;
    throw err;
  }
}
