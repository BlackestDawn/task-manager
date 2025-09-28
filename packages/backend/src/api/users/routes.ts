import { Hono } from "hono";
import { validateID } from "../middleware/helpers";
import { authMiddleware } from "../middleware/config";
import { handlerGetUsers, handlerCreateUser } from "./general";
import { handlerGetUserById, handlerUpdateUser, handlerDeleteUser } from "./direct";
import { handlerGetTasksForUser, handlerGetGroupsForUser } from "./subs";

export const userRoutes = new Hono();

userRoutes.use("(api/users/*", authMiddleware);

userRoutes.get("/api/users", handlerGetUsers);
userRoutes.post("/api/users", handlerCreateUser);

userRoutes.use("/api/users/:id/*", validateID);

userRoutes.get("/api/users/:id", handlerGetUserById);
userRoutes.put("/api/users/:id", handlerUpdateUser);
userRoutes.delete("/api/users/:id", handlerDeleteUser);

userRoutes.put("/api/users/:id/password", handlerUpdateUser);
userRoutes.get("/api/users/:id/tasks", handlerGetTasksForUser);
userRoutes.get("/api/users/:id/groups", handlerGetGroupsForUser);
userRoutes.put("/api/users/:id/disabled", handlerUpdateUser);
