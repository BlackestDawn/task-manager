import { Hono } from "hono";
import { validateID } from "../middleware/helpers";
import { authMiddleware } from "../middleware/config";
import { handlerCreateTask, handlerGetTasksByUserId } from "./general";
import { handlerDeleteTask, handlerGetTaskById, handlerUpdateTask } from "./direct";
import { handlerMarkDone } from "./subs";

export const taskRoutes = new Hono();

taskRoutes.use("(api/tasks/*", authMiddleware);

taskRoutes.get("/api/tasks", handlerGetTasksByUserId);
taskRoutes.post("/api/tasks", handlerCreateTask);

taskRoutes.use("/api/tasks/:id/*", validateID);

taskRoutes.get("/api/tasks/:id", handlerGetTaskById);
taskRoutes.put("/api/tasks/:id", handlerUpdateTask);
taskRoutes.delete("/api/tasks/:id", handlerDeleteTask);

taskRoutes.put("/api/tasks/:id/done", handlerMarkDone);
