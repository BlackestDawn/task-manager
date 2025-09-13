import type { BunRequest } from "bun";
import { corsHeaders } from "../../api/middleware/cors";

export function respondWithJSON(status: number, payload: any, req?: BunRequest) {
  const response = new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", },
  });

  if (req) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });
  }

  return response;
}
