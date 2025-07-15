import z from 'zod';

const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export function validateUser(user: unknown): User {
  const result = UserSchema.safeParse(user);
  if (!result.success) {
    console.error('Invalid user:', result.error);
    throw new Error('Invalid user');
  }
  return result.data;
}

const CreateUserRequestSchema = z.object({
  name: z.string(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export function validateCreateUserRequest(item: unknown): CreateUserRequest {
  const result = CreateUserRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid create user request:', result.error);
    throw new Error('Invalid create user request');
  }
  return result.data;
}

const UpdateUserRequestSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export function validateUpdateUserRequest(item: unknown): UpdateUserRequest {
  const result = UpdateUserRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update user request:', result.error);
    throw new Error('Invalid update user request');
  }
  return result.data;
}
