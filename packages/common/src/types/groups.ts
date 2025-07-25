import z from 'zod';

const groupSchema = z.object({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  description: z.string().nullish().default(null),
  role: z.string(),
  createdBy: z.uuid(),
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
  role: z.string().default("member"),
  createdBy: z.uuid(),
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
  role: z.string().default("member"),
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

export const addOrRemoveUserToGroupRequestSchema = z.object({
  userId: z.uuid(),
  groupId: z.uuid(),
});

export type AddOrRemoveUserToGroupRequest = z.infer<typeof addOrRemoveUserToGroupRequestSchema>;

export function validateAddUserOrRemoveToGroupRequest(item: unknown): AddOrRemoveUserToGroupRequest {
  const result = addOrRemoveUserToGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid add or remove user to group request:', result.error);
    throw new Error('Invalid add or remove user to group request');
  }
  return result.data;
}

export const assignOrRemoveTaskToGroupRequestSchema = z.object({
  taskId: z.uuid(),
  groupId: z.uuid(),
  assignedBy: z.uuid(),
});

export type AssignOrRemoveTaskToGroupRequest = z.infer<typeof assignOrRemoveTaskToGroupRequestSchema>;

export function validateAssignOrRemoveTaskToGroupRequest(item: unknown): AssignOrRemoveTaskToGroupRequest {
  const result = assignOrRemoveTaskToGroupRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid assign or remove task to group request:', result.error);
    throw new Error('Invalid assign or remove task to group request');
  }
  return result.data;
}
