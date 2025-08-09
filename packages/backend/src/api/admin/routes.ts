import { cfg } from "../../config";
import { withConfig } from "../middleware/config";
import { handlerResetDb } from "./admin";

export const adminRoutes = {
  "/admin/reset": {
    POST: withConfig(cfg, handlerResetDb),
  },
}
