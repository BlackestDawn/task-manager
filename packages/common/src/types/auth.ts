import z from 'zod';
import { UserSchema } from './users';
import { UserNotAuthenticatedError } from '../classes/errors';

const LoginRequestSchema = z.object({
  login: z.string().min(1, "Login is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export function validateLoginRequest(item: unknown): LoginRequest {
  const result = LoginRequestSchema.safeParse(item, {
    error: (issue) => "invalid username or password"
  });
  if (!result.success) {
    console.error('Invalid login request:', result.error);
    throw new UserNotAuthenticatedError('invalid username or password');
  }
  return result.data;
}

const LoginResponseSchema = z.object({
  user: UserSchema,
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }).nullish().default(null),
  cookieSet: z.boolean().default(false),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export function validateLoginResponse(item: unknown): LoginResponse {
  const result = LoginResponseSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid login response:', result.error);
    throw new Error('Invalid login response');
  }
  return result.data;
}

const RefreashTokenSchema = z.object({
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.uuid(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullish().default(null),
});

export type RefreashToken = z.infer<typeof RefreashTokenSchema>;

export function validateRefreashToken(item: unknown): RefreashToken {
  const result = RefreashTokenSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid refresh token:', result.error);
    throw new Error('Invalid refresh token');
  }
  return result.data;
}

const RegisterRefreashTokenSchema = z.object({
  token: z.string(),
  userId: z.uuid(),
  expiresAt: z.coerce.date(),
});

export type RegisterRefreashToken = z.infer<typeof RegisterRefreashTokenSchema>;

export function validateRegisterRefreashToken(item: unknown): RegisterRefreashToken {
  const result = RegisterRefreashTokenSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid register refresh token:', result.error);
    throw new Error('Invalid register refresh token');
  }
  return result.data;
}

const DoRefreashTokenByTokenSchema = z.object({
  token: z.string(),
});

export type DoRefreashTokenByToken = z.infer<typeof DoRefreashTokenByTokenSchema>;

export function validateRefreashTokenByToken(item: unknown): DoRefreashTokenByToken {
  const result = DoRefreashTokenByTokenSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid refresh token by token:', result.error);
    throw new Error('Invalid refresh token by token');
  }
  return result.data;
}

const UpdatePasswordRequestSchema = z.object({
  id: z.uuid(),
  password: z.string().min(8, "Password must be at least 8 characters"),
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

const DisabledUserRequestSchema = z.object({
  id: z.uuid(),
  disabled: z.boolean(),
});

export type DisabledUserRequest = z.infer<typeof DisabledUserRequestSchema>;

export function validateDisabledUserRequest(item: unknown): DisabledUserRequest {
  const result = DisabledUserRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid disabled user request:', result.error);
    throw new Error('Invalid disabled user request');
  }
  return result.data;
}
