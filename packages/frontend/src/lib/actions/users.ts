'use server';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverApiRequest } from "@/lib/auth/serverAuth";
import type { ActionResult } from "@/lib/data/interfaces";
import { validateUser, validateCreateUserRequest, validateUpdateUserRequest } from "@task-manager/common";
import type { User, CreateUserRequest, UpdateUserRequest } from "@task-manager/common";

export async function createUserAction(formData: FormData): Promise<ActionResult<User>> {
  try {
    const rawData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string || undefined,
    };

    const validated: CreateUserRequest = validateCreateUserRequest(rawData);

    const res = await serverApiRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify(validated),
    });

    revalidatePath("/users");

    return { success: true, data: validateUser(res) };
  } catch (error) {
    console.error("Failed to create user", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function updateUserAction(formData: FormData, userId: string): Promise<ActionResult<User>> {
  try {
    const rawData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string || undefined,
    };

    const validated: UpdateUserRequest = validateUpdateUserRequest(rawData);

    const res = await serverApiRequest<User>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(validated),
    });

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);

    return { success: true, data: validateUser(res) };
  } catch (error) {
    console.error("Failed to update user", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    await serverApiRequest(`/users/${userId}`, {
      method: "DELETE",
    });

    revalidatePath("/users");
    redirect("/users");
  } catch (error) {
    console.error("Failed to delete user", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

export async function updateUserPasswordAction(formData: FormData, userId: string): Promise<ActionResult<User>> {
  try {
    const password = formData.get("password") as string;
    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" };
    }

    const res = await serverApiRequest<User>(`/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    });

    revalidatePath(`/users/${userId}`);

    return { success: true, data: validateUser(res) };
  } catch (error) {
    console.error("Failed to update user password", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user password",
    };
  }
}

export async function toggleUserDisabledAction(userId: string, disabled: boolean): Promise<ActionResult<User>> {
  try {
    const res = await serverApiRequest<User>(`/users/${userId}/disable`, {
      method: "PUT",
      body: JSON.stringify({ disabled }),
    });

    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);

    return { success: true, data: validateUser(res) };
  } catch (error) {
    console.error("Failed to toggle user disabled status", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle user disabled status",
    };
  }
}
