import { type AppAbility } from "./roles";

export function canUserManageTask(ability: AppAbility, task: any): boolean {
  return ability.can('manage', 'Task', task) || ability.can('manage', 'Task', { userId: task.userId });
}

export function canUserCreateTask(ability: AppAbility): boolean {
  return ability.can('create', 'Task');
}

export function canUserAccessTask(ability: AppAbility, task: any): boolean {
  return ability.can('read', 'Task', task) || ability.can('read', 'Task', { userId: task.userId });
}

export function canUserModifyTask(ability: AppAbility, task: any): boolean {
  return ability.can('update', 'Task', task) || ability.can('update', 'Task', { userId: task.userId });
}

export function canUserDeleteTask(ability: AppAbility, task: any): boolean {
  return ability.can('delete', 'Task', task) || ability.can('delete', 'Task', { userId: task.userId });
}

export function canUserCompleteTask(ability: AppAbility, task: any): boolean {
  return ability.can('markDone', 'Task', task) || ability.can('markDone', 'Task', { userId: task.userId });
}

export function canUserManageGroup(ability: AppAbility, groupId: string): boolean {
  return ability.can('manage', 'Group', { id: groupId });
}

export function canUserCreateGroup(ability: AppAbility, groupName: string): boolean {
  return ability.can('create', 'Group', { name: groupName });
}

export function canUserAccessGroup(ability: AppAbility, groupId: string): boolean {
  return ability.can('read', 'Group', { id: groupId });
}

export function canUserModifyGroup(ability: AppAbility, groupId: string): boolean {
  return ability.can('update', 'Group', { id: groupId });
}

export function canUserDeleteGroup(ability: AppAbility, groupId: string): boolean {
  return ability.can('delete', 'Group', { id: groupId });
}

export function canUserInviteToGroup(ability: AppAbility, groupId: string): boolean {
  return ability.can('invite', 'Group', { id: groupId });
}

export function canUserRemoveFromGroup(ability: AppAbility, groupId: string): boolean {
  return ability.can('remove', 'Group', { id: groupId });
}
