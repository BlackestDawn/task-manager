'use server';
import { revalidatePath } from "next/cache";
import type { User, LoginRequest, LoginResponse, UpdateUserRequest } from "@task-manager/common";
import { validateLoginRequest, validateUpdateUserRequest } from "@task-manager/common";
import { setAuthCookies, clearAuthCookies, getAccessToken, serverGet, serverPut, serverPost } from "@/lib/utils/serverFetch";
import type { AuthState } from "@/lib/data/interfaces/auth";

export async function loginAction(credentials: LoginRequest) {
  try {
    const response = await serverPost<LoginResponse>("/auth/login", validateLoginRequest(credentials), { skipAuth: true },);

    await setAuthCookies(response.tokens.accessToken, response.tokens.refreshToken);

    // revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed"
    };
  }
}

export async function logoutAction() {
  try {
    await serverPost("/auth/logout");
  } catch (error) {
    console.warn("Logout API call failed:", error);
  }

  await clearAuthCookies();

  // revalidatePath("/", "layout");
}

export async function getProfileAction() {
  try {
    return await serverGet<User>("/auth/profile");
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

export async function updateProfileAction(data: UpdateUserRequest) {
  try {
    const response = await serverPut<User>("/auth/profile", validateUpdateUserRequest(data));

    revalidatePath("/", "layout");

    return { user: response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update profile" };
  }
}

export async function checkAuthAction(): Promise<AuthState> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { user: null, isAuthenticated: false };

    const response = await serverGet<User>("/auth/profile");
    return { user: response, isAuthenticated: Boolean(response && !response.disabled) };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { user: null, isAuthenticated: false };
  }
}
