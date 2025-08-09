import { subject } from "@casl/ability";
import { type AppAbility } from "./roles";

// Task checking
export function canUserManageTask(ability: AppAbility, task: any): boolean {
  return ability.can('manage', subject('Task', task));
}

export function canUserCreateTask(ability: AppAbility): boolean {
  return ability.can('create', 'Task');
}

export function canUserAccessTask(ability: AppAbility, task: any): boolean {
  return ability.can('read', subject('Task', task));
}

export function canUserModifyTask(ability: AppAbility, task: any): boolean {
  return ability.can('update', subject('Task', task));
}

export function canUserDeleteTask(ability: AppAbility, task: any): boolean {
  return ability.can('delete', subject('Task', task));
}

export function canUserCompleteTask(ability: AppAbility, task: any): boolean {
  return ability.can('markDone', subject('Task', task));
}

// Group checking
export function canUserManageGroup(ability: AppAbility, group: any): boolean {
  return ability.can('manage', subject('Group', group));
}

export function canUserCreateGroup(ability: AppAbility): boolean {
  return ability.can('create', 'Group');
}

export function canUserAccessGroup(ability: AppAbility, group: any): boolean {
  return ability.can('read', subject('Group', group));
}

export function canUserModifyGroup(ability: AppAbility, group: any): boolean {
  return ability.can('update', subject('Group', group));
}

export function canUserDeleteGroup(ability: AppAbility, group: any): boolean {
  return ability.can('delete', subject('Group', group));
}

export function canUserAssignToGroup(ability: AppAbility, group: any): boolean {
  return ability.can('assign', subject('Group', group));
}

export function canUserRemoveFromGroup(ability: AppAbility, group: any): boolean {
  return ability.can('remove', subject('Group', group));
}

// User checking
export function canUserManageUser(ability: AppAbility, user: any): boolean {
  return ability.can('manage', subject('User', user));
}

export function canUserCreateUser(ability: AppAbility): boolean {
  return ability.can('create', 'User');
}

export function canUserAccessUser(ability: AppAbility, user: any): boolean {
  return ability.can('read', subject('User', user));
}

export function canUserModifyUser(ability: AppAbility, user: any): boolean {
  return ability.can('update', subject('User', user));
}

export function canUserDeleteUser(ability: AppAbility, user: any): boolean {
  return ability.can('delete', subject('User', user));
}

export function canUserModifyPassword(ability: AppAbility, user: any): boolean {
  return ability.can('update', subject('User', user), 'password');
}

export function canUserModifyDisabled(ability: AppAbility, user: any): boolean {
  return ability.can('update', subject('User', user), 'disabled');
}
