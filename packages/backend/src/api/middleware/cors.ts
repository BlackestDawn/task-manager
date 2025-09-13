import { envOrDefault } from "@task-manager/common";

export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Type, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Expose-Headers': 'Set-Cookie',
  'Access-Control-Max-Age': '86400', // 24 hours
};

function getCORSOrigin(req: Request) {
  const origin = req.headers.get('Origin');
  const allowedOrigins = [
    'http://localhost:3020',  // Dev backend
    envOrDefault('APP_DOMAIN', 'http://localhost:3000'),  // full production or dev frontend
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }

  return allowedOrigins[0];
}

export function getSimpleCORSHeaders(req: Request) {
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': getCORSOrigin(req),
  };
}
