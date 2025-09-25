import { ApiClient } from "./client";

export const apiClient = new ApiClient({
  isServer: false,
});

export const serverApiClient = new ApiClient({
  isServer: true,
});
