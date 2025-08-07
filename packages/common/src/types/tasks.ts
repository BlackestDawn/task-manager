import z from 'zod';

const taskItemSchema = z.object({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  description: z.string().nullish().default(null),
  finishBy: z.coerce.date().nullish().default(null),
  completed: z.boolean(),
  completedAt: z.coerce.date().nullish().default(null),
  groups: z.array(z.object({
    id: z.uuid(),
  })).default([]),
});

export type TaskItem = z.infer<typeof taskItemSchema>;

export function validateTaskItem(item: unknown): TaskItem {
  const result = taskItemSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid task item:', result.error);
    throw new Error('Invalid task item');
  }
  return result.data;
}

export function validateTaskItemArray(items: unknown[]): TaskItem[] {
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
  id: z.uuid(),
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
