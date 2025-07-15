import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerGetUsers, handlerCreateUser, handlerUpdateUser, handlerDeleteUser, handlerGetUserById } from "../api/users";

export const userRoutes = {
  "/api/users": {
    GET: withConfig(cfg, handlerGetUsers),
    POST: withConfig(cfg, handlerCreateUser),
  },
  "/api/users/:userId": {
    GET: withConfig(cfg, handlerGetUserById),
    PUT: withConfig(cfg, handlerUpdateUser),
    DELETE: withConfig(cfg, handlerDeleteUser),
  },
}
