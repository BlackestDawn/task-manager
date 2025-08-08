import z from 'zod';

const UserSchema = z.object({
  __typename: z.literal('User'),
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  login: z.string(),
  name: z.string(),
  email: z.string().nullish().default(null),
  disabled: z.boolean().default(false),
  groups: z.array(z.object({
    id: z.uuid(),
    role: z.string(),
  })).default([]),
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

export function validateUserArray(users: unknown[]): User[] {
  const result = UserSchema.array().safeParse(users);
  if (!result.success) {
    console.error('Invalid users', result.error);
    throw new Error('Invalid users');
  }
  return result.data;
}

const CreateUserRequestSchema = z.object({
  login: z.string(),
  password: z.string(),
  name: z.string(),
  email: z.string().nullish().default(null),
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
  login: z.string(),
  name: z.string(),
  email: z.string().nullish().default(null),
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

const updatePasswordRequestSchema = z.object({
  id: z.uuid(),
  password: z.string(),
});

export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>;

export function validateUpdatePasswordRequest(item: unknown): UpdatePasswordRequest {
  const result = updatePasswordRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update password request:', result.error);
    throw new Error('Invalid update password request');
  }
  return result.data;
}

const disabledUserRequestSchema = z.object({
  id: z.uuid(),
  disabled: z.boolean().default(false),
});

export type disabledUserRequest = z.infer<typeof disabledUserRequestSchema>;

export function validateDisabledUserRequest(item: unknown): disabledUserRequest {
  const result = disabledUserRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid disabled user request:', result.error);
    throw new Error('Invalid disabled user request');
  }
  return result.data;
}
