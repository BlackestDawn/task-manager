import { ApiClient } from "./client";

export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020/api",
  timeout: 10000,
});
