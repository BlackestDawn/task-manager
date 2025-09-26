'use server';
import { cookies } from "next/headers";
import type { User } from "@task-manager/common";
import { API_BASE_URL } from "@/lib/data/consts";
import type { AuthState } from "../data/interfaces/auth";

export async function getServerAuthState(): Promise<AuthState> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return { user: null, isAuthenticated: false };

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return { user: null, isAuthenticated: false };

    const user: User = await response.json();
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "applicaton/json",
      ...(accessToken && { "Authorization": `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(`API request failed: ${response.status}`);

  return response.json();
}
