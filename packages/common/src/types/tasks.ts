import z from 'zod';

const taskItemSchema = z.object({
  __typename: z.literal('Task').default('Task'),
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  description: z.string().nullish().default(null),
  finishBy: z.coerce.date().nullish().default(null),
  userId: z.uuid(),
  completed: z.boolean(),
  completedAt: z.coerce.date().nullish().default(null),
  groups: z.array(z.object({
    id: z.uuid(),
  })).default([]),
});

export type Task = z.infer<typeof taskItemSchema>;

export function validateTask(item: unknown): Task {
  const result = taskItemSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid task item:', result.error);
    throw new Error('Invalid task item');
  }
  return result.data;
}

export function validateTaskArray(items: unknown[]): Task[] {
  const result = taskItemSchema.array().safeParse(items);
  if (!result.success) {
    console.error('Invalid task item:', result.error);
    throw new Error('Invalid task item');
  }
  return result.data;
}

const createTaskRequestSchema = z.object({
  title: z.string(),
  description: z.string().nullish().default(null),
  finishBy: z.coerce.date().nullish().default(null),
  userId: z.uuid()
});

export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;

export function validateCreateTaskRequest(item: unknown): CreateTaskRequest {
  const result = createTaskRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid create task request:', result.error);
    throw new Error('Invalid create task request');
  }
  return result.data;
}

const updateTaskRequestSchema = z.object({
  title: z.string(),
  description: z.string().nullish().default(null),
  finishBy: z.coerce.date().nullish().default(null),
});

export type UpdateTaskRequest = z.infer<typeof updateTaskRequestSchema>;

export function validateUpdateTaskRequest(item: unknown): UpdateTaskRequest {
  const result = updateTaskRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update task request:', result.error);
    throw new Error('Invalid update task request');
  }
  return result.data;
}

const UpdateTaskDoneStatusRequestSchema = z.object({
  completed: z.boolean(),
});

export type UpdateTaskDoneStatusRequest = z.infer<typeof UpdateTaskDoneStatusRequestSchema>;

export function validateUpdateTaskDoneStatusRequest(item: unknown): UpdateTaskDoneStatusRequest {
  const result = UpdateTaskDoneStatusRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update task done status request:', result.error);
    throw new Error('Invalid update task done status request');
  }
  return result.data;
}
