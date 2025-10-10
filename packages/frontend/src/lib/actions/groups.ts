'use server';
import { revalidatePath } from "next/cache";
import type { Group, CreateGroupRequest, UpdateGroupRequest, User, AddUserToGroupRequest, RemoveUserFromGroupRequest, Task, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest } from "@task-manager/common";
import { validateCreateGroupRequest, validateUpdateGroupRequest, validateAddUserToGroupRequest, validateRemoveUserFromGroupRequest, validateAssignTaskToGroupRequest, validateRemoveTaskFromGroupRequest } from "@task-manager/common";
import { serverFetch } from "@/lib/utils/serverFetch";

export async function getGroupsAction(): Promise<Group[]> {
  try {
    return await serverFetch<Group[]>("/groups");
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }
}

export async function getGroupAction(id: string): Promise<Group | null> {
  try {
    return await serverFetch<Group>(`/groups/${id}`);
  } catch (error) {
    console.error(`Failed to fetch group ${id}:`, error);
    return null;
  }
}

export async function getGroupTasksAction(id: string): Promise<Task[]> {
  try {
    return await serverFetch<Task[]>(`/groups/${id}/tasks`);
  } catch (error) {
    console.error(`Failed to fetch tasks for group ${id}:`, error);
    return [];
  }
}

export async function getGroupMembersAction(id: string): Promise<User[]> {
  try {
    return await serverFetch<User[]>(`/groups/${id}/users`);
  } catch (error) {
    console.error(`Failed to fetch users for group ${id}:`, error);
    return [];
  }
}

export async function createGroupAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
    }
    const data: CreateGroupRequest = validateCreateGroupRequest(rawData);

    const response = await serverFetch<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/groups");
    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Group creation failed" };
  }
}

export async function updateGroupAction(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
    }
    const data: UpdateGroupRequest = validateUpdateGroupRequest(rawData);

    const response = await serverFetch<Group>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${id}`);
    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Group update failed" };
  }
}

export async function deleteGroupAction(id: string) {
  try {
    await serverFetch(`/groups/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/groups");

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Group deletion failed" };
  }
}

export async function addUserToGroupAction(groupId: string, formData: FormData) {
  try {
    const rawData = {
      userId: formData.get("userId") as string,
      role: formData.get("role") as string || "user",
    }
    const data: AddUserToGroupRequest = validateAddUserToGroupRequest(rawData);

    const response = await serverFetch<Group>(`/groups/${groupId}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/users");
    revalidatePath(`/users/${data.userId}`);

    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Adding user to group failed" };
  }
}

export async function removeUserFromGroupAction(groupId: string, formData: FormData) {
  try {
    const rawData = {
      userId: formData.get("userId") as string,
    }
    const data: RemoveUserFromGroupRequest = validateRemoveUserFromGroupRequest(rawData);

    const response = await serverFetch<Group>(`/groups/${groupId}/users`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/users");
    revalidatePath(`/users/${data.userId}`);

    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Removing user from group failed" };
  }
}

export async function assignTaskToGroupAction(groupId: string, formData: FormData) {
  try {
    const rawData = {
      taskId: formData.get("taskId") as string,
      assignedBy: formData.get("assignedBy") as string,
    }
    const data: AssignTaskToGroupRequest = validateAssignTaskToGroupRequest(rawData);

    const response = await serverFetch<Group>(`/groups/${groupId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${data.taskId}`);

    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Assigning task to group failed" };
  }
}

export async function removeTaskFromGroupAction(groupId: string, formData: FormData) {
  try {
    const rawData = {
      taskId: formData.get("taskId") as string,
    }
    const data: RemoveTaskFromGroupRequest = validateRemoveTaskFromGroupRequest(rawData);

    const response = await serverFetch<Group>(`/groups/${groupId}/tasks`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });

    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${data.taskId}`);

    return response;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Removing task from group failed" };
  }
}
