import type { ErrorHandler } from "hono";
import { HTTPErrors } from "@task-manager/common";
import { cfg } from "../../config";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const errorHandlingMiddleware: ErrorHandler = (err, c) => {
  let statusCode = 500;
  let message = "something went wrong on our end";

  if (err instanceof HTTPErrors) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (statusCode >= 500) {
    const errStr = errStringFromError(err);
    if (cfg.platform === "dev") {
      message = errStr;
    }
    console.error('🚨 Server Error:', {
      error: errStr,
      requestId: c.get('requestId'),
      path: c.req.path,
      method: c.req.method,
      timestamp: new Date().toISOString()
    });
  } else {
    // Log client errors for debugging
    console.warn('⚠️ Client Error:', {
      status: statusCode,
      message,
      requestId: c.get('requestId'),
      path: c.req.path,
      method: c.req.method,
      timestamp: new Date().toISOString()
    });
  }

  return c.json({
    error: message,
    requestId: c.get('requestId'),
    timestamp: new Date().toISOString()
  }, statusCode as ContentfulStatusCode);
};

function errStringFromError(err: unknown) {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "An unknown error occurred";
}
