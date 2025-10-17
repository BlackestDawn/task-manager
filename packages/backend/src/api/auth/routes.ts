import { Hono } from "hono";
import { authMiddleware } from "../middleware/config";
import { handlerLoginUser, handlerRefreshAccessToken, handlerRevokeRefreshToken, handlerGetSelf, handlerUpdateSelf } from "./general";

export const authRoutes = new Hono();

authRoutes.post("/api/auth/login", handlerLoginUser);
authRoutes.post("/api/auth/refresh", handlerRefreshAccessToken);

authRoutes.use("/api/auth/logout", authMiddleware);
authRoutes.post("/api/auth/logout", handlerRevokeRefreshToken);

authRoutes.use("/api/auth/profile", authMiddleware);
authRoutes.get("/api/auth/profile", handlerGetSelf);
authRoutes.put("/api/auth/profile", handlerUpdateSelf);
