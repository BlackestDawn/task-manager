import { cfg } from "./config";
import { runMigrations, closeConnection } from "./db";
import { errorHandlingMiddleware } from "./api/middleware/errors";
import { corsHeaders, getSimpleCORSHeaders } from "./api/middleware/cors";
import { adminRoutes } from "./api/admin/routes";
import { taskRoutes } from "./api/tasks/routes";
import { userRoutes } from "./api/users/routes";
import { authRoutes } from "./api/auth/routes";
import { groupRoutes } from "./api/groups/routes";
import type { BunRequest } from "bun";
import { envOrDefault } from "@task-manager/common";

const server = Bun.serve({
  port: cfg.port,
  development: cfg.platform === "dev",
  routes: {
    ...adminRoutes,
    ...authRoutes,
    ...taskRoutes,
    ...userRoutes,
    ...groupRoutes,
    '/api/cors/test': {
      GET: (req: BunRequest) => {
        const response = new Response(JSON.stringify({
          message: 'CORS working!',
          origin: req.headers.get('Origin'),
          clientType: req.headers.get('X-Client-Type'),
        }), {
          headers: { 'Content-Type': 'application/json' },
        });

        Object.entries(getSimpleCORSHeaders(req)).forEach(([key, value]) => {
          response.headers.set(key, value as string);
        });

        return response;
      }
    },
  },

  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: getSimpleCORSHeaders(req) });

    const response = new Response("Not found", { status: 404 });
    Object.entries(getSimpleCORSHeaders(req)).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });

    return response;
  },

  error(error) {
    const errorResponse = errorHandlingMiddleware(cfg, error);

    errorResponse.headers.set('Access-Control-Allow-Origin', envOrDefault('APP_DOMAIN', 'http://localhost:3000'));
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');

    return errorResponse;
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
