import { apiClient } from "@/lib/api";
import type {
  Group,
  AddUserToGroupRequest,
  AssignTaskToGroupRequest,
  RemoveUserFromGroupRequest,
  RemoveTaskFromGroupRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupWithStats,
  GroupMember,
  GroupTask,
} from "@task-manager/common";

export const groupsApi = {
  getAllGroups: (): Promise<GroupWithStats[]> =>
    apiClient.get('/groups/all'),

  getUserGroups: (): Promise<GroupWithStats[]> =>
    apiClient.get('/groups'),

  getGroupById: (id: string): Promise<Group> =>
    apiClient.get(`/groups/${id}`),

  createGroup: (data: CreateGroupRequest): Promise<Group> =>
    apiClient.post('/groups', data),

  updateGroup: (id: string, data: Partial<UpdateGroupRequest>): Promise<Group> =>
    apiClient.put(`/groups/${id}`, data),

  deleteGroup: (id: string): Promise<void> =>
    apiClient.delete(`/groups/${id}`),

  getGroupMembers: (id: string): Promise<GroupMember[]> =>
    apiClient.get(`/groups/${id}/users`),

  addUserToGroup: (data: AddUserToGroupRequest): Promise<void> =>
    apiClient.post(`/groups/${data.groupId}/users`, data),

  removeUserFromGroup: (data: RemoveUserFromGroupRequest): Promise<void> =>
    apiClient.delete(`/groups/${data.groupId}/users`, { data }),

  getGroupTasks: (id: string): Promise<GroupTask[]> =>
    apiClient.get(`/groups/${id}/tasks`),

  assignTaskToGroup: (data: AssignTaskToGroupRequest): Promise<void> =>
    apiClient.post(`/groups/${data.groupId}/tasks`, data),

  removeTaskFromGroup: (data: RemoveTaskFromGroupRequest): Promise<void> =>
    apiClient.delete(`/groups/${data.groupId}/tasks`, { data }),
};
