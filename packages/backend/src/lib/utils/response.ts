import type { BunRequest } from "bun";
import { getSimpleCORSHeaders } from "../../api/middleware/cors";

export function respondWithJSON(status: number, payload: any, req?: BunRequest) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (req) {
    Object.assign(headers, getSimpleCORSHeaders(req));
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
}
