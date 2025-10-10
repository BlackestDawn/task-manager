'use server';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/data/consts";

interface ServerFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

interface RefreshResponse {
  accessToken: string;
}

export async function serverFetch<T>(endpoint: string, options: ServerFetchOptions = {}): Promise<T> {
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

  const accessToken = await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (!skipAuth && accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && !skipRefresh && !skipAuth) {
    console.log("Received 401, attempting token refresh...");

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.warn("No refresh token available, clearing cookies");
      await clearAuthCookies();
      redirect("/login");
    }

    try {
      // Attempt to refresh the token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: refreshToken }),
        cache: "no-store",
      });

      if (!refreshResponse.ok) {
        throw new Error("Token refresh failed");
      }

      const refreshData: RefreshResponse = await refreshResponse.json();

      await setAuthCookies(refreshData.accessToken, refreshToken);

      console.log("Token refreshed successfully, retrying original request");

      const retryHeaders: HeadersInit = {
        ...headers,
        "Authorization": `Bearer ${refreshData.accessToken}`,
      };

      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers: retryHeaders,
        cache: "no-store",
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({
          message: `Request failed: ${retryResponse.status}`
        }));
        throw new Error(errorData.message || `API Error: ${retryResponse.status}`);
      }

      return retryResponse.json();

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

  return response.json();
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
    secure: process.env.PLATFORM === "prod",
    sameSite: "lax",
    maxAge: 3600, // 1 hour
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.PLATFORM === "prod",
    sameSite: "lax",
    maxAge: 3600 * 24 * 60, // 60 days
    path: "/",
  });
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value || null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value || null;
}

export async function isAuthenticated() {
  const accessToken = await getAccessToken();
  return Boolean(accessToken);
}
