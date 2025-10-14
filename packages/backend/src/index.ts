import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { secureHeaders } from "hono/secure-headers"
import { timing } from "hono/timing"
import { compress } from "hono/compress"
import { requestId } from "hono/request-id"
import { poweredBy } from "hono/powered-by"
import { etag } from "hono/etag"

import { cfg } from "./config"
import { runMigrations, closeConnection } from "./db"
import { errorHandlingMiddleware } from "./api/middleware/errors"
import { corsOptions } from "./api/middleware/cors";
import { addConfig } from "./api/middleware/config"

import { authRoutes } from "./api/auth/routes"
import { userRoutes } from "./api/users/routes"
import { taskRoutes } from "./api/tasks/routes"
import { groupRoutes } from "./api/groups/routes"
import { adminRoutes } from "./api/admin/routes"

const app = new Hono();

app.use("*", requestId());
app.use("*", timing());
app.use("*", logger());
// app.use("*", compress());
app.use("*", secureHeaders());
app.use("*", cors(corsOptions));
app.use("*", prettyJSON());
app.use("*", etag());
app.use("*", poweredBy());
app.use("*", addConfig);

app.onError(errorHandlingMiddleware);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    platform: cfg.platform,
    requestId: c.get("requestId"),
  });
});

app.route("/", authRoutes);
app.route("/", userRoutes);
app.route("/", taskRoutes);
app.route("/", groupRoutes);
app.route("/", adminRoutes);

async function startServer() {
  try {
    await runMigrations(cfg.db);
    console.log("Database migration complete successfully!");

    const server = serve({
      fetch: app.fetch,
      port: cfg.port,
    });

    console.log(`🚀 Hono server running at http://localhost:${cfg.port}`);
    console.log(`📊 Environment: ${cfg.platform}`);
    console.log(`🔧 Health check: http://localhost:${cfg.port}/health`);

    process.on("SIGINT", async () => {
      console.log('\n🛑 SIGINT signal received, shutting down gracefully...');
      await closeConnection(cfg.db);
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log('\n🛑 SIGTERM signal received, shutting down gracefully...');
      await closeConnection(cfg.db);
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
