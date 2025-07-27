import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerCreateGroup, handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById, handlerGetGroups, handlerGetGroupMembers, handlerGetGroupTasks, handlerAddUserToGroup, handlerRemoveUserFromGroup, handlerAssignTaskToGroup, handlerRemoveTaskFromGroup } from "../api/groups";

export const groupRoutes = {
  "/api/groups": {
    GET: withConfig(cfg, handlerGetGroups),
    POST: withConfig(cfg, handlerCreateGroup),
  },
  "/api/groups/:groupId": {
    GET: withConfig(cfg, handlerGetGroupById),
    PUT: withConfig(cfg, handlerUpdateGroup),
    DELETE: withConfig(cfg, handlerDeleteGroup),
  },
  "/api/groups/:groupId/users": {
    GET: withConfig(cfg, handlerGetGroupMembers),
    POST: withConfig(cfg, handlerAddUserToGroup),
    DELETE: withConfig(cfg, handlerRemoveUserFromGroup),
  },
  "/api/groups/:groupId/tasks": {
    GET: withConfig(cfg, handlerGetGroupTasks),
    POST: withConfig(cfg, handlerAssignTaskToGroup),
    DELETE: withConfig(cfg, handlerRemoveTaskFromGroup),
  },
}
