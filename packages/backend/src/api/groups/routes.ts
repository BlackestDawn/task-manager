import { cfg } from "../../config";
import { restrictedEndpoint } from "../middleware/config";
import { handlerCreateGroup, handlerGetGroups } from "./general";
import { handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById } from "./direct";
import { handlerGetGroupMembers, handlerGetGroupTasks, handlerAddUserToGroup, handlerRemoveUserFromGroup, handlerAssignTaskToGroup, handlerRemoveTaskFromGroup } from "./subs";

export const groupRoutes = {
  "/api/groups": {
    GET: restrictedEndpoint(cfg, handlerGetGroups),
    POST: restrictedEndpoint(cfg, handlerCreateGroup),
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
