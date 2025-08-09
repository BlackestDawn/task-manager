import { AbilityBuilder, createMongoAbility, type PureAbility } from "@casl/ability";
import { type UserContext } from "./types";

export type GroupRole = 'admin' | 'manager' | 'editor' | 'user' | 'viewer' | 'none';

export const groupRoleList = [
  'admin',
  'manager',
  'editor',
  'user',
  'viewer',
  'none',
] as const satisfies readonly GroupRole[];

export type Subjects = "Task" | "Group" | "User" | "all";

export type Actions = "create" | "read" | "update" | "delete" | "manage" | "assign" | "remove" | "markDone";

export type AppAbility = PureAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: UserContext): AppAbility {
  const { can: allow, cannot: forbid, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  user.groups.forEach(({ id: groupId, role }) =>{
    switch (role) {
      case "admin":
        allow("manage", "all");
        break;
      case "manager":
        allow(["assign", "remove", "update"], "Group", { id: groupId });
        allow("read", "Group");
        allow("manage", "Task", { 'groups.id': groupId });
        allow("update", "User", ["disabled", "name", "email"], { 'groups.id': groupId });
        break;
      case "editor":
        allow(["create", "update", "delete", "read"], "Task", { 'groups.id': groupId });
        allow("read", "Group");
        forbid("delete", "Task", { completed: true });
        break;
      case "user":
        allow(["read", "markDone"], "Task", { 'groups.id': groupId });
        allow("read", "Group");
        break;
      case "viewer":
        allow("read", "Task", { 'groups.id': groupId });
        allow("read", "Group");
        break;
      case "none":
        break;
    }
  });

  allow("read", "User", { id: user.id });
  allow("update", "User", { id: user.id });
  allow("manage", "Task", { userId: user.id });

  return build({ detectSubjectType: (object: any) => {
    return object.__typename || object.type;
  }});
}
