import { cfg } from "../../config";
import { restrictedEndpoint, withConfig } from "../middleware/config";
import { handlerGetUsers, handlerCreateUser } from "./general";
import { handlerGetUserById, handlerUpdateUser, handlerDeleteUser } from "./direct";
import { handlerUpdateUserPassword, handlerGetTasksForUser, handlerGetGroupsForUser, handlerDisabledUser } from "./subs";

/*
export const userRoutes = {
  "/api/users": {
    GET: restrictedEndpoint(cfg, handlerGetUsers),
    POST: restrictedEndpoint(cfg, handlerCreateUser),
  },
  "/api/users/:userId": {
    GET: restrictedEndpoint(cfg, handlerGetUserById),
    PUT: restrictedEndpoint(cfg, handlerUpdateUser),
    DELETE: restrictedEndpoint(cfg, handlerDeleteUser),
  },
  "/api/users/:userId/password": {
    PUT: restrictedEndpoint(cfg, handlerUpdateUserPassword),
  },
  "/api/users/:userId/tasks": {
    GET: restrictedEndpoint(cfg, handlerGetTasksForUser),
  },
  "/api/users/:userId/groups": {
    GET: restrictedEndpoint(cfg, handlerGetGroupsForUser),
  },
  "/api/users/:userId/disabled": {
    PUT: restrictedEndpoint(cfg, handlerDisabledUser),
  },
}
*/

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
  "/api/users/:userId/tasks": {
    GET: withConfig(cfg, handlerGetTasksForUser),
  },
  "/api/users/:userId/groups": {
    GET: withConfig(cfg, handlerGetGroupsForUser),
  },
  "/api/users/:userId/disabled": {
    PUT: withConfig(cfg, handlerDisabledUser),
  },
}
