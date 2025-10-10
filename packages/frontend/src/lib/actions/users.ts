'use server';
import { revalidatePath } from "next/cache";
import type { User, CreateUserRequest, UpdateUserRequest, UpdatePasswordRequest, UpdateUserDisabledRequest, Task, Group } from "@task-manager/common";
import { validateCreateUserRequest, validateUpdateUserRequest, validateUpdatePasswordRequest, validateUpdateUserDisabledRequest } from "@task-manager/common";
import { serverFetch } from "@/lib/utils/serverFetch";

export async function getUsersAction(): Promise<User[]> {
  try {
    return await serverFetch<User[]>("/users");
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getUserAction(id: string): Promise<User | null> {
  try {
    return await serverFetch<User>(`/users/${id}`);
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return null;
  }
}

export async function getUserTasksAction(id: string): Promise<Task[]> {
  try {
    return await serverFetch<Task[]>(`/users/${id}/tasks`);
  } catch (error) {
    console.error(`Failed to fetch tasks for user ${id}:`, error);
    return [];
  }
}

export async function getUserGroupsAction(id: string): Promise<Group[]> {
  try {
    return await serverFetch<Group[]>(`/users/${id}/groups`);
  } catch (error) {
    console.error(`Failed to fetch groups for user ${id}:`, error);
    return [];
  }
}

export async function createUserAction(formData: FormData) {
  try {
    const rawData = {
      login: formData.get("login") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      accessLevel: formData.get("accessLevel") as string || "user",
    }
    const data: CreateUserRequest = validateCreateUserRequest(rawData);

    const response = await serverFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/users");

    return { user: response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "User creation failed" };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    const rawData = {
      login: formData.get("login") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string || null,
      accessLevel: formData.get("accessLevel") as string || "user",
    }
    const data: UpdateUserRequest = validateUpdateUserRequest(rawData);

    const response = await serverFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    return { user: response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "User update failed" };
  }
}

export async function updateUserPasswordAction(id: string, formData: FormData) {
  try {
    const rawData = {
      password: formData.get("password") as string,
    }
    const data: UpdatePasswordRequest = validateUpdatePasswordRequest(rawData);

    await serverFetch(`/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Password update failed" };
  }
}

export async function updateUserDisabledAction(id: string, disabled: boolean) {
  try {
    const rawData = { disabled };
    const data: UpdateUserDisabledRequest = validateUpdateUserDisabledRequest(rawData);

    const response = await serverFetch<User>(`/users/${id}/disabled`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    return { user: response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update user status" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await serverFetch(`/users/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/users");

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "User deletion failed" };
  }
}
