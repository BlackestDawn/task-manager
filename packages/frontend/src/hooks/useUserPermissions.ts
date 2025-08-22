import { useAuthContext } from "@/components/auth/authProvider";
import type { User } from "@task-manager/common";

export function useUserPermissions() {
  const { user: currentUser, ability } = useAuthContext();

  const canViewUser = () => ability.can('read', 'User');
  const canCreateUser = () => ability.can('create', 'User');
  const canUpdateUser = (user?: User) => {
    if (!user) return false;
    if (user.id === currentUser?.id) return true;
    return ability.can('update', 'User');
  };

  const canDeleteUser = (user?: User) => {
    if (!user) return false;
    if (user.id === currentUser?.id) return false;
    return ability.can('delete', 'User');
  };

  const canManageUserStatus = (user?: User) => {
    if (!user) return false;
    if (user.id === currentUser?.id) return false;
    return ability.can('update', 'User');
  };

  return {
    canViewUser,
    canCreateUser,
    canUpdateUser,
    canDeleteUser,
    canManageUserStatus,
  };
}
