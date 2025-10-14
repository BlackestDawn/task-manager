'use server';
import { revalidatePath } from "next/cache";
import type { Group, CreateGroupRequest, UpdateGroupRequest, User, AddUserToGroupRequest, RemoveUserFromGroupRequest, Task, AssignTaskToGroupRequest, RemoveTaskFromGroupRequest } from "@task-manager/common";
import { validateCreateGroupRequest, validateUpdateGroupRequest, validateAddUserToGroupRequest, validateRemoveUserFromGroupRequest, validateAssignTaskToGroupRequest, validateRemoveTaskFromGroupRequest} from "@task-manager/common";
import { serverGet, serverPost, serverPut, serverDelete } from "@/lib/utils/serverFetch";

export async function getGroupsAction(): Promise<Group[]> {
  try {
    return await serverGet<Group[]>("/groups");
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    return [];
  }
}

export async function getGroupAction(id: string): Promise<Group | null> {
  try {
    return await serverGet<Group>(`/groups/${id}`);
  } catch (error) {
    console.error(`Failed to fetch group ${id}:`, error);
    return null;
  }
}

export async function getAllGroupsAction(): Promise<Group[]> {
  try {
    return await serverGet<Group[]>("/groups/all");
  } catch (error) {
    console.error("Failed to fetch all groups:", error);
    return [];
  }
}

export async function getGroupTasksAction(id: string): Promise<Task[]> {
  try {
    return await serverGet<Task[]>(`/groups/${id}/tasks`);
  } catch (error) {
    console.error(`Failed to fetch tasks for group ${id}:`, error);
    return [];
  }
}

export async function getGroupMembersAction(id: string): Promise<User[]> {
  try {
    return await serverGet<User[]>(`/groups/${id}/users`);
  } catch (error) {
    console.error(`Failed to fetch users for group ${id}:`, error);
    return [];
  }
}

export async function createGroupAction(data: CreateGroupRequest) {
  try {
    const response = await serverPost<Group>("/groups", validateCreateGroupRequest(data));
    revalidatePath("/groups");
    return { success: true, group: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Group creation failed",
    };
  }
}

export async function updateGroupAction(id: string, data: UpdateGroupRequest) {
  try {
    const response = await serverPut<Group>(`/groups/${id}`, validateUpdateGroupRequest(data));
    revalidatePath("/groups");
    revalidatePath(`/groups/${id}`);
    return { success: true, group: response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Group update failed",
    };
  }
}

export async function deleteGroupAction(id: string) {
  try {
    await serverDelete(`/groups/${id}`);
    revalidatePath("/groups");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Group deletion failed",
    };
  }
}

export async function addUserToGroupAction(groupId: string, data: AddUserToGroupRequest) {
  try {
    await serverPost(`/groups/${groupId}/users`, validateAddUserToGroupRequest(data));
    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/users");
    revalidatePath(`/users/${data.userId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Adding user to group failed",
    };
  }
}

export async function removeUserFromGroupAction(groupId: string, data: RemoveUserFromGroupRequest) {
  try {
    await serverDelete(`/groups/${groupId}/users`, { body: JSON.stringify(validateRemoveUserFromGroupRequest(data)) });
    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/users");
    revalidatePath(`/users/${data.userId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Removing user from group failed",
    };
  }
}

export async function assignTaskToGroupAction(groupId: string, data: AssignTaskToGroupRequest) {
  try {
    await serverPost(`/groups/${groupId}/tasks`, validateAssignTaskToGroupRequest(data));
    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${data.taskId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Assigning task to group failed",
    };
  }
}

export async function removeTaskFromGroupAction(groupId: string, data: RemoveTaskFromGroupRequest) {
  try {
    serverDelete(`/groups/${groupId}/tasks`, { body: JSON.stringify(validateRemoveTaskFromGroupRequest(data)) });
    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${data.taskId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Removing task from group failed",
    };
  }
}
