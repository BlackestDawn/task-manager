'use server';
import { QueryClient } from "@tanstack/react-query";
import { serverApiRequest } from "@/lib/auth/serverAuth";
import { TASK_KEYS } from "@/lib/api/tasks/queries";
import type { User, Group, Task } from "@task-manager/common";

export async function prefetchUserData(queryClient: QueryClient) {
  try {
    const users = await serverApiRequest<User[]>("/users");
    queryClient.setQueryData(["users", "list", {}], users);
  } catch (error) {
    console.warn("Failed to prefetch users:", error);
  }
}

export async function prefetchGroupData(queryClient: QueryClient) {
  try {
    const groups = await serverApiRequest<Group[]>("/groups");
    queryClient.setQueryData(["groups", "list", "user"], groups);
  } catch (error) {
    console.warn("Failed to prefetch groups:", error);
  }
}

export async function prefetchTaskData(queryClient: QueryClient) {
  try {
    const tasks = await serverApiRequest<Task[]>("/tasks");
    queryClient.setQueryData(["tasks", "list", "user"], tasks);
  } catch (error) {
    console.warn("Failed to prefetch tasks:", error);
  }
}

export async function prefetchUserProfile(queryClient: QueryClient) {
  try {
    const user = await serverApiRequest<User>("/auth/profile");
    queryClient.setQueryData(["auth", "profile"], user);
  } catch (error) {
    console.warn("Failed to prefetch user profile:", error);
  }
}

export async function prefetchGroupDetails(queryClient: QueryClient, groupId: string) {
  try {
    const [group, members, tasks] = await Promise.all([
      serverApiRequest<Group>(`/groups/${groupId}`),
      serverApiRequest<User[]>(`/groups/${groupId}/users`),
      serverApiRequest<Task[]>(`/groups/${groupId}/tasks`),
    ]);

    queryClient.setQueryData(["groups", "detail", groupId], group);
    queryClient.setQueryData(["groups", "members", groupId], members);
    queryClient.setQueryData(["groups", "tasks", groupId], tasks);
  } catch (error) {
    console.warn(`Failed to prefetch group ${groupId} details:`, error);
  }
}

export async function prefetchUserDetails(queryClient: QueryClient, userId: string) {
  try {
    const [user, tasks, groups] = await Promise.all([
      serverApiRequest<User>(`/users/${userId}`),
      serverApiRequest<Task[]>(`/users/${userId}/tasks`),
      serverApiRequest<Group[]>(`/users/${userId}/groups`),
    ]);

    queryClient.setQueryData(["users", "detail", userId], user);
    queryClient.setQueryData(["users", "tasks", userId], tasks);
    queryClient.setQueryData(["users", "groups", userId], groups);
  } catch (error) {
    console.warn(`Failed to prefetch user ${userId} details:`, error);
  }
}

export async function prefetchTaskDetails(queryClient: QueryClient, taskId: string) {
  try {
    const task = await serverApiRequest<Task>(`/tasks/${taskId}`);
    queryClient.setQueryData(TASK_KEYS.detail(taskId), task);
  } catch (error) {
    console.warn(`Failed to prefetch task ${taskId} details:`, error);
  }
}
