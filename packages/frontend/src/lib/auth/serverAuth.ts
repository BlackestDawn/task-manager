'use server';
import type { User } from "@task-manager/common";
import type { AuthState } from "@/lib/data/interfaces/auth";
import { serverFetch, getAccessToken } from "@/lib/utils/serverFetch";

export async function getServerAuthState(): Promise<AuthState> {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) return { user: null, isAuthenticated: false };

    const user = await serverFetch<User>("/auth/profile");

    return {
      user,
      isAuthenticated: Boolean(user && !user.disabled),
    };
  } catch (error) {
    console.warn("Server auth check failed:", error);
    return { user: null, isAuthenticated: false };
  }
}
