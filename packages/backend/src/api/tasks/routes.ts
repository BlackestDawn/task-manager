import { cfg } from "../../config";
import { restrictedEndpoint, withConfig } from "../middleware/config";
import { handlerCreateTask, handlerGetTasksByUserId } from "./general";
import { handlerDeleteTask, handlerGetTaskById, handlerUpdateTask } from "./direct";
import { handlerMarkDone } from "./subs";

/*
export const taskRoutes = {
  "/api/tasks": {
    GET: restrictedEndpoint(cfg, handlerGetTasksByUserId),
    POST: restrictedEndpoint(cfg, handlerCreateTask),
  },
  "/api/tasks/:taskId": {
    GET: restrictedEndpoint(cfg, handlerGetTaskById),
    PUT: restrictedEndpoint(cfg, handlerUpdateTask),
    DELETE: restrictedEndpoint(cfg, handlerDeleteTask),
  },
  "/api/tasks/:taskId/done": {
    POST: restrictedEndpoint(cfg, handlerMarkDone),
  },
}
*/

export const taskRoutes = {
  "/api/tasks": {
    GET: withConfig(cfg, handlerGetTasksByUserId),
    POST: withConfig(cfg, handlerCreateTask),
  },
  "/api/tasks/:taskId": {
    GET: withConfig(cfg, handlerGetTaskById),
    PUT: withConfig(cfg, handlerUpdateTask),
    DELETE: withConfig(cfg, handlerDeleteTask),
  },
  "/api/tasks/:taskId/done": {
    POST: withConfig(cfg, handlerMarkDone),
  },
}
