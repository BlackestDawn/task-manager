'use server';
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { User, LoginRequest, LoginResponse, UpdateUserRequest } from "@task-manager/common";
import { validateLoginRequest, validateUpdateUserRequest } from "@task-manager/common";
import { serverFetch, setAuthCookies, clearAuthCookies } from "@/lib/utils/serverFetch";

export async function loginAction(formData: FormData) {
  try {
    const rawData = {
      login: formData.get("login") as string,
      password: formData.get("password") as string,
    }

    const data: LoginRequest = validateLoginRequest(rawData);

    const response = await serverFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
      skipRefresh: true,
    });

    await setAuthCookies(response.tokens.accessToken, response.tokens.refreshToken);

    revalidatePath("/", "layout");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Login failed" };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  try {
    await serverFetch("/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("Logout API call failed:", error);
  }

  await clearAuthCookies();

  revalidatePath("/", "layout");
  redirect("/");
}

export async function getProfileAction() {
  try {
    return await serverFetch<User>("/users/profile");
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

export async function updateProfileAction(formData: FormData) {
  try {
    const rawData = {
      login: formData.get("login") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string || null,
      accessLevel: formData.get("accessLevel") as string || "user",
    };

    const data: Partial<UpdateUserRequest> = validateUpdateUserRequest(rawData);

    const response = await serverFetch<User>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    revalidatePath("/", "layout");

    return { user: response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update profile" };
  }
}
