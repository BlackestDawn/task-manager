import { Hono } from "hono";
import { validateID } from "../middleware/helpers";
import { handlerCreateGroup, handlerGetGroups } from "./general";
import { handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById } from "./direct";
import { handlerGetGroupMembers, handlerGetGroupTasks, handlerAddUserToGroup, handlerRemoveUserFromGroup, handlerAssignTaskToGroup, handlerRemoveTaskFromGroup } from "./subs";
import { authMiddleware } from "../middleware/config";

export const groupRoutes = new Hono();

groupRoutes.use("/api/groups/*", authMiddleware);

groupRoutes.get("/api/groups", handlerGetGroups);
groupRoutes.post("/api/groups", handlerCreateGroup);

groupRoutes.use("/api/groups/:id/*", validateID);

groupRoutes.get("/api/groups/:id", handlerGetGroupById);
groupRoutes.put("/api/groups/:id", handlerUpdateGroup);
groupRoutes.delete("/api/groups/:id", handlerDeleteGroup);
groupRoutes.get("/api/groups/:id/users", handlerGetGroupMembers);
groupRoutes.post("/api/groups/:id/users", handlerAddUserToGroup);
groupRoutes.delete("/api/groups/:id/users", handlerRemoveUserFromGroup);
groupRoutes.get("/api/groups/:id/tasks", handlerGetGroupTasks);
groupRoutes.post("/api/groups/:id/tasks", handlerAssignTaskToGroup);
groupRoutes.delete("/api/groups/:id/tasks", handlerRemoveTaskFromGroup);
