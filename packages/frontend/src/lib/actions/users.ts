'use server';
import { revalidatePath } from "next/cache";
import type { User, CreateUserRequest, UpdateUserRequest, UpdatePasswordRequest, UpdateUserDisabledRequest, Task, Group } from "@task-manager/common";
import { validateCreateUserRequest, validateUpdateUserRequest, validateUpdatePasswordRequest, validateUpdateUserDisabledRequest } from "@task-manager/common";
import { serverGet, serverPost, serverPut, serverDelete } from "@/lib/utils/serverFetch";

export async function getUsersAction(): Promise<User[]> {
  try {
    return await serverGet<User[]>("/users");
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function getUserAction(id: string): Promise<User | null> {
  try {
    return await serverGet<User>(`/users/${id}`);
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return null;
  }
}

export async function getUserTasksAction(id: string): Promise<Task[]> {
  try {
    return await serverGet<Task[]>(`/users/${id}/tasks`);
  } catch (error) {
    console.error(`Failed to fetch tasks for user ${id}:`, error);
    return [];
  }
}

export async function getUserGroupsAction(id: string): Promise<Group[]> {
  try {
    return await serverGet<Group[]>(`/users/${id}/groups`);
  } catch (error) {
    console.error(`Failed to fetch groups for user ${id}:`, error);
    return [];
  }
}

export async function createUserAction(data: CreateUserRequest) {
  try {
    const response = await serverPost<User>("/users", validateCreateUserRequest(data));
    revalidatePath("/users");
    return { success: true, user: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "User creation failed",
    };
  }
}

export async function updateUserAction(id: string, data: UpdateUserRequest) {
  try {
    const response = await serverPut<User>(`/users/${id}`, validateUpdateUserRequest(data));
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { success: true, user: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "User update failed",
    };
  }
}

export async function updateUserPasswordAction(id: string, data: UpdatePasswordRequest) {
  try {
    await serverPut(`/users/${id}/password`, validateUpdatePasswordRequest(data));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password update failed",
    };
  }
}

export async function updateUserDisabledAction(id: string, data: UpdateUserDisabledRequest) {
  try {
    const response = await serverPut<User>(`/users/${id}/disabled`, validateUpdateUserDisabledRequest(data));
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { success: true, user: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user status",
    };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await serverDelete(`/users/${id}`);
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "User deletion failed",
    };
  }
}
