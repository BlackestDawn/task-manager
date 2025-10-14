import type { Context, Next } from "hono";
import { validateDoByUUIDRequest, type DoByUUIDRequest } from "@task-manager/common";

export async function validateID(c: Context, next: Next) {
  const id = c.req.param("id");
  try {
    const validID = validateDoByUUIDRequest(id) as DoByUUIDRequest;
    c.set("recID", validID);
  } catch (err) {
    console.error(err);
    return c.json({ error: "Invalid ID in API path" }, 400);
  }
  await next();
}
