import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { User } from "@task-manager/common";
import { AbilityChecker } from "@task-manager/common";

export function useUserPermissions() {
  const { ability } = useAuthContext();
  const abilities = new AbilityChecker({ ability });

  const canViewUser = (user?: User) => abilities.canViewObject(user);

  const canCreateUser = () => abilities.canCreateObject('User');

  const canEditUser = (user?: User) => abilities.canEditObject(user);

  const canEditUserField = (user?: User, field?: string) => abilities.canEditObjectField(user, field);

  const canDeleteUser = (user?: User) => abilities.canDeleteObject(user);

  return {
    canViewUser,
    canCreateUser,
    canEditUser,
    canEditUserField,
    canDeleteUser,
  };
}
