import { ApiClient } from "./client";
import { API_BASE_URL } from "../data/consts";

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 10000,
  isServer: false,
});

export const serverApiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 10000,
  isServer: true,
});
