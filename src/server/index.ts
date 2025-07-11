import { cfg } from "./config";
import { errorHandlingMiddleware, withConfig } from "./api/middleware";
import spa from "../client/index.html"
import { handlerResetDb } from "./api/admin";
import {
  handlerGetTasks,
  handlerCreateTask,
  handlerUpdateTask,
  handlerDeleteTask,
  handlerGetTaskById,
  handlerMarkDone
} from "./api/tasks";

const server = Bun.serve({
  port: cfg.port,
  development: cfg.platform === "dev",
  routes: {
    "/": spa,
    "/api/tasks": {
      GET: withConfig(cfg, handlerGetTasks),
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
    "/admin/reset": {
      POST: withConfig(cfg, handlerResetDb),
    }
  },
  error(error) {
    return errorHandlingMiddleware(cfg, error);
  }
});

console.log(`Server running at http://localhost:${server.port}`);
