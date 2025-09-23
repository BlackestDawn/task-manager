import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "./api";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { UpdateGroupRequest } from "@task-manager/common";
import { AbilityChecker } from "@task-manager/common";

export const GROUP_KEYS = {
  all: ["groups"] as const,
  lists: () => [...GROUP_KEYS.all, "list"] as const,
  userGroups: () => [...GROUP_KEYS.lists(), "user"] as const,
  allGroups: () => [...GROUP_KEYS.lists(), "all"] as const,
  details: () => [...GROUP_KEYS.all, "detail"] as const,
  detail: (id: string) => [...GROUP_KEYS.details(), id] as const,
  members: (id: string) => [...GROUP_KEYS.all, "members", id] as const,
  tasks: (id: string) => [...GROUP_KEYS.all, "tasks", id] as const,
} as const;

export function useGroups() {
  const { ability } = useAuthContext();
  const abilities = new AbilityChecker(ability);
  const canViewAll = abilities.canManageObject("all");

  return useQuery({
    queryKey: canViewAll ? GROUP_KEYS.allGroups() : GROUP_KEYS.userGroups(),
    queryFn: canViewAll ? groupsApi.getAllGroups : groupsApi.getUserGroups,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: GROUP_KEYS.detail(id),
    queryFn: () => groupsApi.getGroupById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: GROUP_KEYS.members(groupId),
    queryFn: () => groupsApi.getGroupMembers(groupId),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useGroupTasks(groupId: string) {
  return useQuery({
    queryKey: GROUP_KEYS.tasks(groupId),
    queryFn: () => groupsApi.getGroupTasks(groupId),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupRequest }) =>
      groupsApi.updateGroup(id, data),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData(GROUP_KEYS.detail(updatedGroup.id), updatedGroup);
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.deleteGroup,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: GROUP_KEYS.detail(deletedId) });
      queryClient.removeQueries({ queryKey: GROUP_KEYS.members(deletedId) });
      queryClient.removeQueries({ queryKey: GROUP_KEYS.tasks(deletedId) });
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}

export function useAddUserToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.addUserToGroup,
    onSuccess: (_, {groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.members(groupId) });
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}

export function useRemoveUserFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.removeUserFromGroup,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.members(groupId) });
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}

export function useAssignTaskToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.assignTaskToGroup,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.tasks(groupId) });
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}

export function useRemoveTaskFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: groupsApi.removeTaskFromGroup,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.tasks(groupId) });
      queryClient.invalidateQueries({ queryKey: GROUP_KEYS.lists() });
    },
  });
}
