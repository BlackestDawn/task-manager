import { useProfile } from "@/lib/api/auth/queries";
import type { AuthState } from "@/lib/data/interfaces/auth";
import { defineAbilityFor } from "@task-manager/common";
import { useEffect, useMemo } from "react";

export function useAuth(initialState?: AuthState | null) {
  const { data: user, isLoading, error } = useProfile(initialState);
  const ability = useMemo(() => defineAbilityFor(user || null), [user]);
  const isAuthenticated = Boolean(user && !user.disabled)

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Auth state updated:", {
        user: user ? { id: user.id, name: user.name } : null,
        isAuthenticated,
        isLoading,
        hasInitialState: Boolean(initialState),
      });
    }
  }, [user, isAuthenticated, isLoading, initialState]);

  return {
    user,
    ability,
    isAuthenticated,
    isLoading,
    error,
  };
}
