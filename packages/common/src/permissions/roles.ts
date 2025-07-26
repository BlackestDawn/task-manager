export type GroupRole = 'admin' | 'manager' | 'editor' | 'user' | 'viewer' | 'none';

export const groupRoleList = [
  'admin',
  'manager',
  'editor',
  'user',
  'viewer',
  'none',
] as const satisfies readonly GroupRole[];
