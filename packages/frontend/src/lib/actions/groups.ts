'use server';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverApiRequest } from "@/lib/auth/serverAuth";
import type { ActionResult } from "@/lib/data/interfaces";
import { validateGroup, validateCreateGroupRequest, validateUpdateGroupRequest } from "@task-manager/common";
import type { Group, CreateGroupRequest, UpdateGroupRequest } from "@task-manager/common";

export async function createGroupAction(formData: FormData): Promise<ActionResult<Group>> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    const validated: CreateGroupRequest = validateCreateGroupRequest(rawData);

    const res = await serverApiRequest<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(validated),
    });

    revalidatePath("/groups");

    return { success: true, data: validateGroup(res) };
  } catch (error) {
    console.error("Failed to create group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create group",
    };
  }
}

export async function updateGroupAction(formData: FormData, groupId: string): Promise<ActionResult<Group>> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    const validated: UpdateGroupRequest = validateUpdateGroupRequest(rawData);

    const res = await serverApiRequest<Group>(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(validated),
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);

    return { success: true, data: validateGroup(res) };
  } catch (error) {
    console.error("Failed to update group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update group",
    };
  }
}

export async function deleteGroupAction(groupId: string): Promise<ActionResult> {
  try {
    await serverApiRequest<void>(`/groups/${groupId}`, {
      method: "DELETE",
    });

    revalidatePath("/groups");
    redirect("/groups");
  } catch (error) {
    console.error("Failed to delete group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete group",
    };
  }
}

export async function addUserToGroupAction(groupId: string, userId: string): Promise<ActionResult> {
  try {
    await serverApiRequest<void>(`/groups/${groupId}/users`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to add user to group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add user to group",
    };
  }
}

export async function removeUserFromGroupAction(groupId: string, userId: string): Promise<ActionResult> {
  try {
    await serverApiRequest<void>(`/groups/${groupId}/users/${userId}`, {
      method: "DELETE",
    });

    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to remove user from group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove user from group",
    };
  }
}

export async function assignTaskToGroupAction(groupId: string, taskId: string): Promise<ActionResult> {
  try {
    await serverApiRequest<void>(`/groups/${groupId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ taskId }),
    });

    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/tasks/${taskId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to assign task to group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign task to group",
    };
  }
}

export async function removeTaskFromGroupAction(groupId: string, taskId: string): Promise<ActionResult> {
  try {
    await serverApiRequest<void>(`/groups/${groupId}/tasks/${taskId}`, {
      method: "DELETE",
    });

    revalidatePath(`/groups/${groupId}`);
    revalidatePath(`/tasks/${taskId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to unassign task from group", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unassign task from group",
    };
  }
}
