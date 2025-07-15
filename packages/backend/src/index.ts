import { cfg } from "./config";
import { runMigrations, closeConnection } from "./db";
import { errorHandlingMiddleware } from "./api/middleware/errors";
import { corsHeaders } from "./api/middleware/cors";
import { adminRoutes } from "./routes/admin";
import { taskRoutes } from "./routes/tasks";
import { userRoutes } from "./routes/users";

const server = Bun.serve({
  port: cfg.port,
  development: cfg.platform === "dev",
  routes: {
    ...adminRoutes,
    ...taskRoutes,
    ...userRoutes,
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
