import { useProfile } from "@/lib/auth/queries";
import { defineAbilityFor } from "@task-manager/common";
import { useMemo } from "react";

export function useAuth() {
  const { data: user, isLoading, error } = useProfile();
  const ability = useMemo(() => defineAbilityFor(user || null), [user]);
  const isAuthenticated = Boolean(user && !user.disabled)

  return {
    user,
    ability,
    isAuthenticated,
    isLoading,
    error,
  }
}