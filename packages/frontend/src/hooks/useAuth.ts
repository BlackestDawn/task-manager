import { useProfile } from "@/lib/api/auth/queries";
import { defineAbilityFor } from "@task-manager/common";
import { useEffect, useMemo } from "react";

export function useAuth() {
  const { data: user, isLoading, error, dataUpdatedAt } = useProfile();
  const ability = useMemo(() => defineAbilityFor(user || null), [user]);
  const isAuthenticated = Boolean(user && !user.disabled)

  useEffect(() => {
    console.log("Auth state updated:", {
      user: user ? {id: user.id, name: user.name} : null,
      isAuthenticated,
      isLoading,
      dataUpdatedAt: new Date(dataUpdatedAt).toISOString(),
      hasToken: typeof window !== "undefined" ? Boolean(localStorage.getItem("auth_token")) : false
    });
  }, [user, isAuthenticated, isLoading, dataUpdatedAt]);

  return {
    user,
    ability,
    isAuthenticated,
    isLoading,
    error,
  };
}