import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerLoginUser, handlerRefreshAccessToken, handlerRevokeRefreshToken } from "../api/authentication";

export const authRoutes = {
  "/api/login": {
    POST: withConfig(cfg, handlerLoginUser),
  },
  "/api/refresh": {
    POST: withConfig(cfg, handlerRefreshAccessToken),
  },
  "/api/revoke": {
    POST: withConfig(cfg, handlerRevokeRefreshToken),
  },
}
