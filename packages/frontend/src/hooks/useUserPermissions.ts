import { useAuthContext } from "@/components/auth/authProvider";
import type { User } from "@task-manager/common";

export function useUserPermissions() {
  const { ability } = useAuthContext();

  const canViewUser = () => ability.can('read', 'User');

  const canCreateUser = () => ability.can('create', 'User');

  const canEditUser = (user?: User) => {
    if (!user) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ability.can('update', user as any);
  };

  const canEditUserField = (user?: User, field?: string) => {
    if (!user) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ability.can("update", user as any, field);
  }

  const canDeleteUser = (user?: User) => {
    if (!user) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ability.can('delete', user as any);
  };

  return {
    canViewUser,
    canCreateUser,
    canEditUser,
    canEditUserField,
    canDeleteUser,
  };
}
