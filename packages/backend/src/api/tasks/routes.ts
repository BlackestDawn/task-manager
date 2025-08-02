import { cfg } from "../../config";
import { restrictedEndpoint } from "../middleware/config";
import { handlerCreateTask, handlerGetTasksByUserId } from "./general";
import { handlerDeleteTask, handlerGetTaskById, handlerUpdateTask } from "./direct";
import { handlerMarkDone } from "./subs";

export const taskRoutes = {
  "/api/tasks": {
    GET: restrictedEndpoint(cfg, handlerGetTasksByUserId),
    POST: restrictedEndpoint(cfg, handlerCreateTask),
  },
  "/api/tasks/:taskId": {
    GET: restrictedEndpoint(cfg, handlerGetTaskById),
    PUT: restrictedEndpoint(cfg, handlerUpdateTask),
    DELETE: restrictedEndpoint(cfg, handlerDeleteTask),
  },
  "/api/tasks/:taskId/done": {
    POST: restrictedEndpoint(cfg, handlerMarkDone),
  },
}
