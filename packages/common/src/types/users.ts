import z from 'zod';
import { userRoleList, groupRoleList } from '../permissions/roles';

export const UserSchema = z.object({
  __typename: z.literal('User').default('User'),
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  login: z.string(),
  name: z.string(),
  email: z.string().nullish().default(null),
  disabled: z.boolean().default(false),
  accessLevel: z.enum(userRoleList).default("user"),
  groups: z.array(z.object({
    id: z.uuid(),
    role: z.enum(groupRoleList).default("user"),
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
  accessLevel: z.enum(userRoleList).default("user"),
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
  login: z.string(),
  name: z.string(),
  email: z.string().nullish().default(null),
  accessLevel: z.enum(userRoleList).default("user"),
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

const UpdatePasswordRequestSchema = z.object({
  password: z.string(),
});

export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequestSchema>;

export function validateUpdatePasswordRequest(item: unknown): UpdatePasswordRequest {
  const result = UpdatePasswordRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update password request:', result.error);
    throw new Error('Invalid update password request');
  }
  return result.data;
}

const UpdateUserDisabledRequestSchema = z.object({
  disabled: z.boolean(),
});

export type UpdateUserDisabledRequest = z.infer<typeof UpdateUserDisabledRequestSchema>;

export function validateUpdateUserDisabledRequest(item: unknown): UpdateUserDisabledRequest {
  const result = UpdateUserDisabledRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid update user disabled request:', result.error);
    throw new Error('Invalid update user disabled request');
  }
  return result.data;
}
