import type { BunRequest } from "bun";
import type { ApiConfig } from "../../config";

type HandlerWithConfig = (cfg: ApiConfig, req: BunRequest) => Promise<Response>;

export function withConfig<T extends any>(cfg: ApiConfig, handler: HandlerWithConfig, ...args: T[]) {
  return (req: BunRequest) => handler(cfg, req);
}
