import { AbilityBuilder, createMongoAbility, type MongoAbility, PureAbility } from "@casl/ability";

export type GroupRole = 'admin' | 'manager' | 'editor' | 'user' | 'viewer' | 'none';

export const groupRoleList = [
  'admin',
  'manager',
  'editor',
  'user',
  'viewer',
  'none',
] as const satisfies readonly GroupRole[];

export type Subjects = "Task" | "Group" | "User" | "All";

export type Actions = "create" | "read" | "update" | "delete" | "manage" | "invite" | "remove" | "markDone";

export type AppAbility = PureAbility<[Actions, Subjects]>;
// export type AppAbility = MongoAbility<[Actions, Subjects]>;

export interface UserContext {
  id: string;
  groups: Array<{ id: string; role: GroupRole }>;
}

export function defineAbilityFor(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  can("read", "User", { id: user.id });
  can("update", "User", { id: user.id });
  can("manage", "Task", { userId: user.id });

  user.groups.forEach(({ id: groupId, role }) =>{
    switch (role) {
      case "admin":
        can("manage", "All");
        break;
      case "manager":
        can(["invite", "remove", "update", "read"], "Group", { id: groupId });
        can("manage", "Task", { 'taskGroups.groupId': groupId });
        can("update", "User", ["disabled", "name", "email"])
        break;
      case "editor":
        can(["create", "update", "delete", "read"], "Task", { 'taskGroups.groupId': groupId });
        can("read", "Group");
        cannot("delete", "Task", { completed: true })
        break;
      case "user":
        can(["read", "markDone"], "Task", { 'taskGroups.groupId': groupId });
        can("read", "Group");
        break
      case "viewer":
        can("read", "Task", { 'taskGroups.groupId': groupId });
        can("read", "Group");
        break;
      case "none":
        break;
    }
  });

  return build();
}
