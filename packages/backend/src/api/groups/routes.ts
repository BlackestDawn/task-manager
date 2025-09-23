import { cfg } from "../../config";
import { restrictedEndpoint, withConfig } from "../middleware/config";
import { handlerCreateGroup, handlerGetAllGroups, handlerGetGroupsForSelf } from "./general";
import { handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById } from "./direct";
import { handlerGetGroupMembers, handlerGetGroupTasks, handlerAddUserToGroup, handlerRemoveUserFromGroup, handlerAssignTaskToGroup, handlerRemoveTaskFromGroup } from "./subs";

/*
export const groupRoutes = {
  "/api/groups": {
    GET: restrictedEndpoint(cfg, handlerGetGroupsForSelf),
    POST: restrictedEndpoint(cfg, handlerCreateGroup),
  },
  "/api/groups/all": {
    GET: restrictedEndpoint(cfg, handlerGetAllGroups),
  },
  "/api/groups/:groupId": {
    GET: restrictedEndpoint(cfg, handlerGetGroupById),
    PUT: restrictedEndpoint(cfg, handlerUpdateGroup),
    DELETE: restrictedEndpoint(cfg, handlerDeleteGroup),
  },
  "/api/groups/:groupId/users": {
    GET: restrictedEndpoint(cfg, handlerGetGroupMembers),
    POST: restrictedEndpoint(cfg, handlerAddUserToGroup),
    DELETE: restrictedEndpoint(cfg, handlerRemoveUserFromGroup),
  },
  "/api/groups/:groupId/tasks": {
    GET: restrictedEndpoint(cfg, handlerGetGroupTasks),
    POST: restrictedEndpoint(cfg, handlerAssignTaskToGroup),
    DELETE: restrictedEndpoint(cfg, handlerRemoveTaskFromGroup),
  },
}
*/

export const groupRoutes = {
  "/api/groups": {
    GET: withConfig(cfg, handlerGetGroupsForSelf),
    POST: withConfig(cfg, handlerCreateGroup),
  },
  "/api/groups/all": {
    GET: withConfig(cfg, handlerGetAllGroups),
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
