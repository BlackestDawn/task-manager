import { cfg } from "../../config";
import { withConfig } from "../middleware/config";
import { handlerLoginUser, handlerRefreshAccessToken, handlerRevokeRefreshToken } from "./auth";

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
