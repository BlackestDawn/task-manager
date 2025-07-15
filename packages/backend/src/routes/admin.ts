import { cfg } from "../config";
import { withConfig } from "../api/middleware/config";
import { handlerResetDb } from "../api/admin";

export const adminRoutes = {
  "/admin/reset": {
    POST: withConfig(cfg, handlerResetDb),
  }
}
