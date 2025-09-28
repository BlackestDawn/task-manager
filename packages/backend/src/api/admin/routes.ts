import { Hono } from "hono";
import { handlerResetDb } from "./admin";

export const adminRoutes = new Hono();

adminRoutes.post("/admin/reset", handlerResetDb);
