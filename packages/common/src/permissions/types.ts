import z from "zod";
import { type AppAbility } from "./roles";
import { type User } from "../types/users";
import { userRoleList, groupRoleList } from "./roles";

const UserContextSchema = z.object({
  id: z.uuid(),
  groups: z.array(z.object({
    id: z.uuid(),
    role: z.enum(groupRoleList),
  })).default([]),
  accessLevel: z.enum(userRoleList).default("user"),
});

export type UserContext = z.infer<typeof UserContextSchema>;

export function validateUserContext(item: unknown): UserContext {
  const result = UserContextSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid user context:', result.error);
    throw new Error('Invalid user context');
  }
  return result.data;
}

export type loggedinUser = {
  capabilities: AppAbility;
  userInfo: User;
}
