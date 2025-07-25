import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerCreateGroup, handlerUpdateGroup, handlerDeleteGroup, handlerGetGroupById, handlerGetGroups } from "../api/groups";

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
}
