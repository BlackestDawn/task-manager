import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerGetUsers, handlerCreateUser, handlerUpdateUser, handlerUpdateUserPassword, handlerDeleteUser, handlerGetUserById } from "../api/users";

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
  "/api/users/:userId/password": {
    PUT: withConfig(cfg, handlerUpdateUserPassword),
  },
}
