import type { BunRequest } from "bun";
import type { ApiConfig } from "../../config";
import { UserNotAuthenticatedError, NotFoundError } from "@task-manager/common";
import { validateDoByUUIDRequest, defineAbilityFor, validateUserContext, validateUser } from "@task-manager/common";
import { type loggedinUser } from "@task-manager/common";
import { getUserById } from "../../db/queries/users";
import { getAuthTokenFromHeaders, validateJWT } from "../../lib/auth/authentication";

type HandlerWithConfig = (cfg: ApiConfig, req: BunRequest, user?: loggedinUser) => Promise<Response>;

export function withConfig<T extends any>(cfg: ApiConfig, handler: HandlerWithConfig, ...args: T[]) {
  return (req: BunRequest) => handler(cfg, req);
}

export function restrictedEndpoint<T extends any>(cfg: ApiConfig, handler: HandlerWithConfig, ...args: T[]) {
  return async (req: BunRequest) => {
    const bearerToken = await getAuthTokenFromHeaders(req.headers);
    if (!bearerToken) {
      throw new UserNotAuthenticatedError('Invalid/malformed auth token');
    }

    const userId = await validateJWT(bearerToken);
    const userInfo = await getUserById(cfg.db, validateDoByUUIDRequest(userId));
    if (!userInfo) {
      throw new NotFoundError("User not found");
    }

    const capabilities = defineAbilityFor(validateUserContext(userInfo));

    return handler(cfg, req, {
      capabilities,
      userInfo: validateUser(userInfo),
    });
  }
}
