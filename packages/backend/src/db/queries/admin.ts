import { type DBConn } from "../../config";
import { tasks } from "../schema";

export async function resetDb(db: DBConn) {
  await db.delete(tasks);
}
