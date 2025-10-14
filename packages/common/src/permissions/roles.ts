import { AbilityBuilder, createMongoAbility, type PureAbility } from "@casl/ability";
import { type UserContext } from "./types";

export type GroupRole = 'manager' | 'editor' | 'user' | 'viewer' | 'none';
export const groupRoleList = [
  'manager',
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

export type Subjects = "Task" | "Group" | "User" | "all";
export type Actions = "create" | "read" | "update" | "delete" | "manage" | "assignTask" | "removeTask" | "assignUser" | "removeUser" | "markDone";

export type AppAbility = PureAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: UserContext | null): AppAbility {
  const { can: allow, cannot: forbid, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) throw new Error("Can't define ability for null user");

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
    allow("update", "User", ["disabled", "name", "email", "password"]);
    allow("delete", "User");
  }

  user.groups.forEach(({ id: groupId, role }) => {
    switch (role) {
      case "manager":
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
