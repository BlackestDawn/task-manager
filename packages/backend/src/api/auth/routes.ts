import { cfg } from "../../config";
import { withConfig, restrictedEndpoint } from "../middleware/config";
import { handlerLoginUser, handlerRefreshAccessToken, handlerRevokeRefreshToken, handlerGetSelf, handlerUpdateSelf } from "./general";

export const authRoutes = {
  "/api/auth/login": {
    POST: withConfig(cfg, handlerLoginUser),
  },
  "/api/auth/refresh": {
    POST: withConfig(cfg, handlerRefreshAccessToken),
  },
  "/api/auth/logout": {
    POST: restrictedEndpoint(cfg, handlerRevokeRefreshToken),
  },
  "/api/auth/profile": {
    GET: restrictedEndpoint(cfg, handlerGetSelf),
    PUT: restrictedEndpoint(cfg, handlerUpdateSelf),
  }
}
