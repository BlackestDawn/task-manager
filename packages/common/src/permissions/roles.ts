import { AbilityBuilder, createMongoAbility, type PureAbility } from "@casl/ability";
import type { UserContext } from "./types";
import type { User } from "../types/users";
import type { Group } from "../types/groups";
import type { Task } from "../types/tasks";

export type GroupRole = 'supervisor' | 'editor' | 'user' | 'viewer' | 'none';
export const groupRoleList = [
  'supervisor',
  'editor',
  'user',
  'viewer',
  'none',
] as const satisfies readonly GroupRole[];

export type UserRole = "admin" | "manager" | "user";
export const userRoleList = [
  "admin",
  "manager",
  "user",
] as const satisfies readonly UserRole[];

export type Subjects = "Task" | "Group" | "User" | "all" | User | Group | Task;
export type Actions = "create" | "read" | "update" | "delete" | "manage" | "assignTask" | "removeTask" | "assignUser" | "removeUser" | "markDone";

export type AppAbility = PureAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: UserContext | null): AppAbility {
  const { can: allow, cannot: forbid, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) return build();

  const typeDetection = (object: any) => {
    return object.__typename || object.type;
  };

  allow("read", "User", { id: user.id });
  allow("update", "User", { id: user.id });
  allow("manage", "Task", { userId: user.id });
  allow("read", "Group");
  allow("read", "User");
  forbid("update", "User", ["login"]);

  if (user.accessLevel === "admin") {
    allow("manage", "all");
    return build({ detectSubjectType: typeDetection });
  }

  if (user.accessLevel === "manager") {
    allow("manage", "Group");
    allow("create", "User");
    allow("update", "User", ["disabled", "name", "email", "password", "accessLevel"]);
    allow("delete", "User");
  }

  // No one may change their own disabled/accessLevel status — admins are
  // exempt (they return above before reaching this rule).
  forbid("update", "User", ["disabled", "accessLevel"], { id: user.id });

  user.groups.forEach(({ id: groupId, role }) => {
    switch (role) {
      case "supervisor":
        allow(["assignTask", "removeTask", "assignUser", "removeUser", "update"], "Group", { id: groupId });
        allow("manage", "Task", { 'groups.id': groupId });
        break;
      case "editor":
        allow(["create", "update", "delete", "read", "markDone"], "Task", { 'groups.id': groupId });
        allow("assignTask", "Group", { id: groupId })
        forbid("delete", "Task", { completed: true });
        allow("delete", "Task", { userId: user.id });
        break;
      case "user":
        allow("read", "Task", { 'groups.id': groupId });
        allow(["markDone"], "Task", { 'groups.id': groupId });
        break;
      case "viewer":
        allow("read", "Task", { 'groups.id': groupId });
        break;
      case "none":
        forbid("manage", "Group", { id: groupId });
        forbid("manage", "Task", { 'groups.id': groupId });
        // Making sure they can manage own tasks
        allow("manage", "Task", { userId: user.id });
        break;
    }
  });

  return build({ detectSubjectType: typeDetection });
}
