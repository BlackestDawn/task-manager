import { corsHeaders } from "../../api/middleware/cors";

export function respondWithJSON(status: number, payload: any, headers: Record<string, string> = {}) {
  const body = JSON.stringify(payload);
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...headers,
    },
  });
}
