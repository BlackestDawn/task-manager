import { envOrDefault } from "@task-manager/common";

export const corsHeaders = {
  'Access-Control-Allow-Origin': envOrDefault('CORS_ORIGIN', 'http://localhost:5173'), // Vite's default port
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};
