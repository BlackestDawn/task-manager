'use server';
import { cookies } from "next/headers";
import type { User } from "@task-manager/common";
import { API_BASE_URL } from "@/lib/data/consts";

export async function getServerAuthState(): Promise<{ user: User | null; isAuthenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return { user: null, isAuthenticated: false };

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        "X-Client-Type": "web",
      },
      cache: "no-store",
    });

    if (!response.ok) return { user: null, isAuthenticated: false };

    const user = await response.json();
    return {
      user,
      isAuthenticated: Boolean(user && !user.disabled)
    };
  } catch (error) {
    console.warn("Server auth check failed:", error);
    return { user: null, isAuthenticated: false };
  }
}

export async function serverApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "applicaton/json",
      "X-Client-Type": "web",
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(`API request failed: ${response.status}`);

  return response.json();
}
