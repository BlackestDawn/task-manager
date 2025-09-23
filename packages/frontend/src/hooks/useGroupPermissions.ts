import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { Group } from "@task-manager/common";
import { AbilityChecker } from "@task-manager/common";

export function useGroupPermissions() {
  const { user, ability } = useAuthContext();
  const abilities = new AbilityChecker(ability);

  const canViewGroups = () => abilities.canViewObject("Group");

  const canCreateGroups = () => abilities.canCreateObject("Group");

  const canUpdateGroup = (group?: Group) => abilities.canEditObject(group);

  const canDeleteGroup = (group?: Group) => abilities.canDeleteObject(group);

  const canAddUserToGroup = (group?: Group)=> abilities.canAssignUser(group);

  const canRemoveUserFromGroup = (group?: Group) => abilities.canRemoveUser(group);

  const canManageGroupUsers = (group?: Group) =>
    canAddUserToGroup(group) && canRemoveUserFromGroup(group);

  const canAssignTaskToGroup = (group?: Group) => abilities.canAssignUser(group);

  const canRemoveTaskFromGroup = (group?: Group) => abilities.canRemoveTask(group);

  const canManageGroupTasks = (group?: Group) =>
    canAssignTaskToGroup(group) || canRemoveTaskFromGroup(group);

  const getUserRoleInGroup = (groupId: string): string | null => {
    if (!user) return null;
    const userGroup = user.groups.find(g => g.id === groupId);
    return userGroup?.role || null;
  }

  return {
    canViewGroups,
    canCreateGroups,
    canUpdateGroup,
    canDeleteGroup,
    canAddUserToGroup,
    canRemoveUserFromGroup,
    canManageGroupUsers,
    canAssignTaskToGroup,
    canRemoveTaskFromGroup,
    canManageGroupTasks,
    getUserRoleInGroup,
  }
}
