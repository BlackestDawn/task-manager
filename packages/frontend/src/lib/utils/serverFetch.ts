'use server';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/data/consts";
import type { RefreshAccessTokenResponse } from "@task-manager/common";

interface ServerFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: RefreshAccessTokenResponse = await response.json();
    await setAuthCookies(data.accessToken, refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp - now < 60; // Consider token expired if less than 60 seconds remain
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return null as T;

  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");

  // If content-length is 0 or missing content-type, return null
  if (contentLength === "0" || !contentType) return null as T;

  // Only parse as JSON if content-type indicates JSON
  if (contentType && contentType.includes("application/json")) return response.json();

  return null as T;
}

async function serverFetch<T>(endpoint: string, options: ServerFetchOptions = {}): Promise<T> {
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

  const accessToken = await getAccessToken();

  console.log(`Accessing ${endpoint} using access token: ${accessToken ? accessToken.slice(0, 10) + "..." : "none"}`);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    ...fetchOptions.headers,
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: fetchOptions.cache || "no-store",
  });

  if (response.status === 401 && !skipRefresh && !skipAuth) {
    console.log("Received 401, attempting token refresh...");

    try {
      // Attempt to refresh the token
      const refreshData = await refreshAccessToken();
      if (!refreshData) {
        console.log("No refresh token available, redirecting to login");
        await clearAuthCookies();
        redirect("/login");
      }

      console.log("Token refreshed successfully, retrying original request");

      const retryHeaders: HeadersInit = {
        ...headers,
        "Authorization": `Bearer ${refreshData}`,
      };

      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
        cache: fetchOptions.cache || "no-store",
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({
          message: `Request failed: ${retryResponse.status}`
        }));
        throw new Error(errorData.message || `API Error: ${retryResponse.status}`);
      }

      return parseResponse<T>(retryResponse);

    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      await clearAuthCookies();
      redirect("/login");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Request failed: ${response.status}`
    }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return parseResponse<T>(response);
}

export async function serverGet<T>(endpoint: string, option?: ServerFetchOptions): Promise<T> {
  return serverFetch<T>(endpoint, { ...option, method: "GET" });
}

export async function serverPost<T>(endpoint: string, data?: unknown, option?: ServerFetchOptions): Promise<T> {
  return serverFetch<T>(endpoint, {
    ...option,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function serverPut<T>(endpoint: string, data?: unknown, option?: ServerFetchOptions): Promise<T> {
  return serverFetch<T>(endpoint, {
    ...option,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function serverDelete<T>(endpoint: string, option?: ServerFetchOptions): Promise<T> {
  return serverFetch<T>(endpoint, { ...option, method: "DELETE" });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.PLATFORM === "prod" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600, // 1 hour
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.PLATFORM === "prod" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600 * 24 * 60, // 60 days
    path: "/",
  });
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken && isTokenExpired(accessToken)) {
    const newToken = await refreshAccessToken();
    return newToken;
  }
  return accessToken || null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value || null;
}

export async function isAuthenticated() {
  const accessToken = await getAccessToken();
  return Boolean(accessToken);
}
