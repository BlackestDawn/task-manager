import { type DBConn } from "../../config";
import { tasks, users } from "../schema";

export async function resetDb(db: DBConn) {
  await db.delete(users);
  await db.delete(tasks);
}
