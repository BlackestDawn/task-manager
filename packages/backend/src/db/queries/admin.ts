import { type DBConn } from "../../config";
import { tasks, users, groups, refresh_tokens } from "../schema";

export async function resetDb(db: DBConn) {
  await db.delete(groups);
  await db.delete(tasks);
  await db.delete(refresh_tokens);
  await db.delete(users);
}
