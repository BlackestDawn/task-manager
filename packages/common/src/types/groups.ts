import z from 'zod';
import { groupRoleList } from "@task-manager/common";

const groupSchema = z.object({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  description: z.string().nullish().default(null),
  role: z.enum(groupRoleList).default("user"),
});

export type Group = z.infer<typeof groupSchema>;

export function validateGroup(group: unknown): Group {
  const result = groupSchema.safeParse(group);
  if (!result.success) {
    console.error('Invalid group:', result.error);
    throw new Error('Invalid group');
  }
  return result.data;
}

export function validateGroupArray(groups: unknown[]): Group[] {
  const result = groupSchema.array().safeParse(groups);
  if (!result.success) {
    console.error('Invalid groups', result.error);
    throw new Error('Invalid groups');
  }
  return result.data;
}

const createGroupRequestSchema = z.object({
  name: z.string(),
  description: z.string().nullish().default(null),
  role: z.enum(groupRoleList).default("user"),
});

export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;

export function validateCreateGroupRequest(item: unknown): CreateGroupRequest {
  const result = createGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid create group request:', result.error);
    throw new Error('Invalid create group request');
  }
  return result.data;
}

export const updateGroupRequestSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  role: z.enum(groupRoleList).default("user"),
  description: z.string().nullish().default(null),
});

export type UpdateGroupRequest = z.infer<typeof updateGroupRequestSchema>;

export function validateUpdateGroupRequest(item: unknown): UpdateGroupRequest {
  const result = updateGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update group request:', result.error);
    throw new Error('Invalid update group request');
  }
  return result.data;
}

export const addUserToGroupRequestSchema = z.object({
  userId: z.uuid(),
  groupId: z.uuid(),
});

export type AddUserToGroupRequest = z.infer<typeof addUserToGroupRequestSchema>;

export function validateAddUserToGroupRequest(item: unknown): AddUserToGroupRequest {
  const result = addUserToGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid add user to group request:', result.error);
    throw new Error('Invalid add user to group request');
  }
  return result.data;
}

export const RemoveUserFromGroupRequestSchema = z.object({
  userId: z.uuid(),
  groupId: z.uuid(),
});

export type RemoveUserFromGroupRequest = z.infer<typeof RemoveUserFromGroupRequestSchema>;

export function validateRemoveUserFromGroupRequest(item: unknown): RemoveUserFromGroupRequest {
  const result = RemoveUserFromGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid remove user from group request:', result.error);
    throw new Error('Invalid remove user from group request');
  }
  return result.data;
}

export const assignTaskToGroupRequestSchema = z.object({
  taskId: z.uuid(),
  groupId: z.uuid(),
  assignedBy: z.uuid(),
});

export type AssignTaskToGroupRequest = z.infer<typeof assignTaskToGroupRequestSchema>;

export function validateAssignTaskToGroupRequest(item: unknown): AssignTaskToGroupRequest {
  const result = assignTaskToGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid assign task to group request:', result.error);
    throw new Error('Invalid assign task to group request');
  }
  return result.data;
}

export const RemoveTaskFromGroupRequestSchema = z.object({
  taskId: z.uuid(),
  groupId: z.uuid(),
});

export type RemoveTaskFromGroupRequest = z.infer<typeof RemoveTaskFromGroupRequestSchema>;

export function validateRemoveTaskFromGroupRequest(item: unknown): RemoveTaskFromGroupRequest {
  const result = RemoveTaskFromGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid remove task from group request:', result.error);
    throw new Error('Invalid remove task from group request');
  }
  return result.data;
}
