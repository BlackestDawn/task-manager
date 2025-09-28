import type { Context, Next, MiddlewareHandler } from "hono";
import type { ApiConfig } from "../../config";
import { UserNotAuthenticatedError, NotFoundError } from "@task-manager/common";
import { validateDoByUUIDRequest, AbilityChecker, validateUser } from "@task-manager/common";
import { getUserById } from "../../db/queries/users";
import { getAuthTokenFromHeaders, validateJWT } from "../../lib/auth/authentication";

export type ApiHandler = (c: Context) => Promise<Response>;

export function withConfig(cfg: ApiConfig): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    c.set("config", cfg);
    await next();
  };
}

export async function authMiddleware(c: Context, next: Next) {
  const cfg = c.get("config") as ApiConfig;
  const authHeader = await getAuthTokenFromHeaders(c);

  const userId = await validateJWT(authHeader);
  const userInfo = validateUser(
    await getUserById(cfg.db, validateDoByUUIDRequest(userId))
  );

  if (!userInfo) throw new NotFoundError("User not found");
  if (userInfo.disabled) throw new UserNotAuthenticatedError("User is disabled");

  const capabilities = new AbilityChecker({ user: userInfo });

  c.set("user", userInfo);
  c.set("capabilities", capabilities);

  await next();
}
