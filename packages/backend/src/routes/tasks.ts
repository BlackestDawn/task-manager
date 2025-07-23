import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerGetTasksByUserId, handlerCreateTask, handlerUpdateTask, handlerDeleteTask, handlerGetTaskById, handlerMarkDone } from "../api/tasks";

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
