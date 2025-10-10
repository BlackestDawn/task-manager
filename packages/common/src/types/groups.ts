import z from 'zod';
import { groupRoleList } from "../permissions/roles";

const groupSchema = z.object({
  __typename: z.literal('Group').default('Group'),
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  description: z.string().nullish().default(null),
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
    console.error('Invalid group array', result.error);
    throw new Error('Invalid group array');
  }
  return result.data;
}

const groupWithStatsSchema = groupSchema.extend({
  userCount: z.number().default(0),
  taskCount: z.number().default(0),
});

export type GroupWithStats = z.infer<typeof groupWithStatsSchema>;

export function validateGroupWithStats(group: unknown): GroupWithStats {
  const result = groupWithStatsSchema.safeParse(group);
  if (!result.success) {
    console.error('Invalid group with stats:', result.error);
    throw new Error('Invalid group with stats');
  }
  return result.data;
}

export function validateGroupWithStatsArray(groups: unknown[]): GroupWithStats[] {
  const result = groupWithStatsSchema.array().safeParse(groups);
  if (!result.success) {
    console.error('Invalid group with stats array:', result.error);
    throw new Error('Invalid group with stats array');
  }
  return result.data;
}

const createGroupRequestSchema = z.object({
  name: z.string(),
  description: z.string().nullish().default(null),
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

const updateGroupRequestSchema = z.object({
  name: z.string(),
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

const addUserToGroupRequestSchema = z.object({
  userId: z.uuid(),
  role: z.enum(groupRoleList).default("user"),
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

const RemoveUserFromGroupRequestSchema = z.object({
  userId: z.uuid(),
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

const assignTaskToGroupRequestSchema = z.object({
  taskId: z.uuid(),
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

const RemoveTaskFromGroupRequestSchema = z.object({
  taskId: z.uuid(),
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

const groupMemberSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  login: z.string(),
  email: z.string().nullish().default(null),
  role: z.enum(groupRoleList),
  disabled: z.boolean().default(false),
});

export type GroupMember = z.infer<typeof groupMemberSchema>;

export function validateGroupMember(member: unknown): GroupMember {
  const result = groupMemberSchema.safeParse(member);
  if (!result.success) {
    console.error('Invalid group member:', result.error);
    throw new Error("Invalid group member");
  }
  return result.data;
}

export function validateGroupMemberArray(members: unknown[]): GroupMember[] {
  const result = groupMemberSchema.array().safeParse(members);
  if (!result.success) {
    console.error('Invalid group member array:', result.error);
    throw new Error("Invalid group member array");
  }
  return result.data;
}

const groupTaskSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullish().default(null),
  completed: z.boolean(),
  userId: z.uuid(),
  userName: z.string(),
  finishBy: z.coerce.date().nullish().default(null),
  completedAt: z.coerce.date().nullish().default(null),
});

export type GroupTask = z.infer<typeof groupTaskSchema>;

export function validateGroupTask(task: unknown): GroupTask {
  const result = groupTaskSchema.safeParse(task);
  if (!result.success) {
    console.error('Invalid group task:', result.error);
    throw new Error("Invalid group task");
  }
  return result.data;
}

export function validateGroupTaskArray(tasks: unknown[]): GroupTask[] {
  const result = groupTaskSchema.array().safeParse(tasks);
  if (!result.success) {
    console.error('Invalid group task array:', result.error);
    throw new Error("Invalid group task array");
  }
  return result.data;
}
