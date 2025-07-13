import { cfg } from "./config";
import { runMigrations, closeConnection } from "./db";
import { withConfig } from "./api/middleware/config";
import { errorHandlingMiddleware } from "./api/middleware/errors";
import { corsHeaders } from "./api/middleware/cors";
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
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers: corsHeaders});
    return new Response("Not found", { status: 404 });
  },
  error(error) {
    return errorHandlingMiddleware(cfg, error);
  }
});

await runMigrations(cfg.db);
console.log(`Server running at http://localhost:${server.port}`);

process.on('SIGINT', () => {
  console.log('SIGINT signal received, shutting down...');
  server.stop();
  closeConnection(cfg.db);
  process.exit(0);
});
