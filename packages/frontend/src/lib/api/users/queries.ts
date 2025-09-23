import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "./api";
import type { User, UpdateUserRequest } from "@task-manager/common";
import { getTZNormalizedDate } from "@task-manager/common";

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: (filters: Record<string, any> = {}) => [...USER_KEYS.lists(), filters] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string)=> [...USER_KEYS.details(), id] as const,
  tasks: (id: string) => [...USER_KEYS.all, 'tasks', id] as const,
  groups: (id: string) => [...USER_KEYS.all, 'groups', id],
} as const;

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn: usersApi.getUsers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: enabled && Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserTasks(id: string) {
  return useQuery({
    queryKey: USER_KEYS.tasks(id),
    queryFn: () => usersApi.getUserTasks(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserGroups(id: string) {
  return useQuery({
    queryKey: USER_KEYS.groups(id),
    queryFn: () => usersApi.getUserGroups(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: (newUser) => {
      queryClient.setQueryData<User[]>(USER_KEYS.list(), (old = []) => [...old, newUser]);
      queryClient.setQueryData(USER_KEYS.detail(newUser.id), newUser);
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateUserRequest> }) => usersApi.updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_KEYS.detail(updatedUser.id), updatedUser);
      queryClient.setQueryData<User[]>(USER_KEYS.list(), (old = []) =>
        old.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(updatedUser.id) });
    }
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<User[]>(USER_KEYS.list(), (old = []) =>
        old.filter(user => user.id !== deletedId)
      );
      queryClient.removeQueries({ queryKey: USER_KEYS.detail(deletedId) });
      queryClient.removeQueries({ queryKey: USER_KEYS.tasks(deletedId) });
      queryClient.removeQueries({ queryKey: USER_KEYS.groups(deletedId) });
    },
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string; }) =>
      usersApi.updateUserPassword(id, password),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_KEYS.detail(updatedUser.id), updatedUser);
      queryClient.setQueryData<User[]>(USER_KEYS.list(), (old = []) =>
        old.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
    },
  });
}

export function useUpdateUserDisabledStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean; }) =>
      usersApi.updateUserDiasabledStatus(id, disabled),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_KEYS.detail(updatedUser.id), updatedUser);
      queryClient.setQueryData<User[]>(USER_KEYS.list(), (old = []) =>
        old.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
    },
    onMutate: async ({ id, disabled }) => {
      await queryClient.cancelQueries({ queryKey: USER_KEYS.detail(id) });
      const previousUser = queryClient.getQueryData<User>(USER_KEYS.detail(id));

      if (previousUser) {
        queryClient.setQueryData<User>(USER_KEYS.detail(id), {
          ...previousUser,
          disabled,
          updatedAt: getTZNormalizedDate(),
        });
      }

      return { previousUser };
    },
    onError: (err, {id }, context) => {
      console.warn("Could not update disable status:", err);

      if (context?.previousUser) {
        queryClient.setQueryData(USER_KEYS.detail(id), context.previousUser);
      }
    }
  })
}
