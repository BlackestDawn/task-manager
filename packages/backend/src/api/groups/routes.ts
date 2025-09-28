import { Hono } from "hono";
import { validateID } from "../middleware/helpers";
import { handlerCreateGroup, handlerGetAllGroups, handlerGetGroupsForSelf } from "./general";
import { handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById } from "./direct";
import { handlerGetGroupMembers, handlerGetGroupTasks, handlerAddUserToGroup, handlerRemoveUserFromGroup, handlerAssignTaskToGroup, handlerRemoveTaskFromGroup } from "./subs";

export const groupRoutes = new Hono();

groupRoutes.get("/api/groups", handlerGetGroupsForSelf);
groupRoutes.post("/api/groups", handlerCreateGroup);
groupRoutes.get("/api/groups/all", handlerGetAllGroups);

groupRoutes.use("/api/groups/:id", validateID);

groupRoutes.get("/api/groups/:id", handlerGetGroupById);
groupRoutes.put("/api/groups/:id", handlerUpdateGroup);
groupRoutes.delete("/api/groups/:id", handlerDeleteGroup);
groupRoutes.get("/api/groups/:id/users", handlerGetGroupMembers);
groupRoutes.post("/api/groups/:id/users", handlerAddUserToGroup);
groupRoutes.delete("/api/groups/:id/users", handlerRemoveUserFromGroup);
groupRoutes.get("/api/groups/:id/tasks", handlerGetGroupTasks);
groupRoutes.post("/api/groups/:id/tasks", handlerAssignTaskToGroup);
groupRoutes.delete("/api/groups/:id/tasks", handlerRemoveTaskFromGroup);
