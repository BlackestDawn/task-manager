import { QueryClient, dehydrate } from "@tanstack/react-query";
import { serverApiRequest } from "@/lib/auth/serverAuth";
import { TASK_KEYS } from "@/lib/api/tasks/queries";
import { USER_KEYS } from "@/lib/api/users/queries";
import { GROUP_KEYS } from "@/lib/api/groups/queries";
import type { User, Group, Task } from "@task-manager/common";
import { FIVE_MINUTES, TWO_MINUTES } from "@/lib/data/consts";

export interface ServerFetchResult<T> {
  data: T;
  dehydratedState: unknown;
}

export interface ServerFetchOptions {
  populateCache?: boolean;
  staleTime?: number;
}

class ServerDataFetcher {
  private queryClient: QueryClient;

  constructor() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: FIVE_MINUTES,
        },
      },
    });
  }

  private async fetchAndCache<T>(
    endpoint: string,
    queryKey: readonly unknown[],
    options: ServerFetchOptions = {}
  ): Promise<ServerFetchResult<T>> {
    const { populateCache = true, staleTime } = options;

    try {
      const data = await serverApiRequest<T>(endpoint);

      if (populateCache) {
        this.queryClient.setQueryData(queryKey, data);
        if (staleTime) {
          this.queryClient.setQueryDefaults(queryKey, { staleTime });
        }
      }

      return {
        data,
        dehydratedState: dehydrate(this.queryClient),
      };
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  async fetchTasks(options?: ServerFetchOptions): Promise<ServerFetchResult<Task[]>> {
    return this.fetchAndCache<Task[]>(
      "/tasks",
      TASK_KEYS.userTasks(),
      { staleTime: TWO_MINUTES, ...options }
    );
  }

  async fetchTaskById(taskId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<Task>> {
    return this.fetchAndCache<Task>(
      `/tasks/${taskId}`,
      TASK_KEYS.detail(taskId),
      options
    );
  }

  async fetchUsers(options?: ServerFetchOptions): Promise<ServerFetchResult<User[]>> {
    return this.fetchAndCache<User[]>(
      "/users",
      USER_KEYS.list(),
      options
    );
  }

  async fetchUserById(userId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<User>> {
    return this.fetchAndCache<User>(
      `/users/${userId}`,
      USER_KEYS.detail(userId),
      options
    );
  }

  async fetchUserTasks(userId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<Task[]>> {
    return this.fetchAndCache<Task[]>(
      `/users/${userId}/tasks`,
      USER_KEYS.tasks(userId),
      { staleTime: TWO_MINUTES, ...options }
    );
  }

  async fetchUserGroup(userId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<Group[]>> {
    return this.fetchAndCache<Group[]>(
      `/users/${userId}/groups`,
      USER_KEYS.groups(userId),
      options
    );
  }

  async fetchGroups(options?: ServerFetchOptions): Promise<ServerFetchResult<Group[]>> {
    return this.fetchAndCache<Group[]>(
      "/groups",
      GROUP_KEYS.userGroups(),
      options
    );
  }

  async fetchAllGroups(options?: ServerFetchOptions): Promise<ServerFetchResult<Group[]>> {
    return this.fetchAndCache<Group[]>(
      "/groups/all",
      GROUP_KEYS.allGroups(),
      options
    );
  }

  async fetchGroupById(groupId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<Group>> {
    return this.fetchAndCache<Group>(
      `/groups/${groupId}`,
      GROUP_KEYS.detail(groupId),
      options
    );
  }

  async fetchGroupMembers(groupId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<User[]>> {
    return this.fetchAndCache<User[]>(
      `/groups/${groupId}/users`,
      GROUP_KEYS.members(groupId),
      { staleTime: TWO_MINUTES, ...options }
    );
  }

  async fetchGroupTasks(groupId: string, options?: ServerFetchOptions): Promise<ServerFetchResult<Task[]>> {
    return this.fetchAndCache<Task[]>(
      `/groups/${groupId}/tasks`,
      GROUP_KEYS.tasks(groupId),
      { staleTime: TWO_MINUTES, ...options }
    );
  }

  async fetchUserProfile(options?: ServerFetchOptions): Promise<ServerFetchResult<User>> {
    return this.fetchAndCache<User>(
      "/auth/profile",
      ["auth", "profile"],
      options
    );
  }

  async fetchUserDetails(userId: string, options?: ServerFetchOptions): Promise<{
    user: User;
    tasks: Task[];
    groups: Group[];
    dehydratedState: unknown;
  }> {
    try {
      const [user, tasks, groups] = await Promise.all([
        serverApiRequest<User>(`/users/${userId}`),
        serverApiRequest<Task[]>(`/users/${userId}/tasks`),
        serverApiRequest<Group[]>(`/users/${userId}/groups`),
      ]);

      if (options?.populateCache !== false) {
        this.queryClient.setQueryData(USER_KEYS.detail(userId), user);
        this.queryClient.setQueryData(USER_KEYS.tasks(userId), tasks);
        this.queryClient.setQueryData(USER_KEYS.groups(userId), groups);
      }

      return {
        user,
        tasks,
        groups,
        dehydratedState: dehydrate(this.queryClient),
      };
    } catch (error) {
      console.warn(`Failed to fetch user ${userId} details:`, error);
      throw error;
    }
  }

  async fetchGroupDetails(groupId: string, options?: ServerFetchOptions): Promise<{
    group: Group;
    members: User[];
    tasks: Task[];
    dehydratedState: unknown;
  }> {
    try {
      const [group, members, tasks] = await Promise.all([
        serverApiRequest<Group>(`/groups/${groupId}`),
        serverApiRequest<User[]>(`/groups/${groupId}/users`),
        serverApiRequest<Task[]>(`/groups/${groupId}/tasks`),
      ]);

      if (options?.populateCache !== false) {
        this.queryClient.setQueryData(GROUP_KEYS.detail(groupId), group);
        this.queryClient.setQueryData(GROUP_KEYS.members(groupId), members);
        this.queryClient.setQueryData(GROUP_KEYS.tasks(groupId), tasks);
      }

      return {
        group,
        members,
        tasks,
        dehydratedState: dehydrate(this.queryClient),
      };
    } catch (error) {
      console.warn(`Failed to fetch group ${groupId} details:`, error);
      throw error;
    }
  }

  async fetchDashboardData(options?: ServerFetchOptions): Promise<{
    tasks: Task[];
    dehydratedState: unknown;
  }> {
    try {
      const tasks = await serverApiRequest<Task[]>("/tasks");

      if (options?.populateCache !== false) {
        this.queryClient.setQueryData(TASK_KEYS.userTasks(), tasks);
      }

      return {
        tasks,
        dehydratedState: dehydrate(this.queryClient),
      };
    } catch (error) {
      console.warn("Failed to fetch dashboard data:", error);
      throw error;
    }
  }

  resetQueryClient() {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: FIVE_MINUTES,
        },
      },
    });
  }
}

export const serverDataFetcher = new ServerDataFetcher();
