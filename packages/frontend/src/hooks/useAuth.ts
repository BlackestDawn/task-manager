import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { AuthState } from "@/lib/data/interfaces/auth";
import { defineAbilityFor } from "@task-manager/common";
import { useEffect, useMemo } from "react";

export function useAuth(initialState?: AuthState | null) {
  const { user, isAuthenticated } = useAuthContext();
  const ability = useMemo(() => defineAbilityFor(user || null), [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Auth state updated:", {
        user: user ? { id: user.id, name: user.name } : null,
        isAuthenticated,
        hasInitialState: Boolean(initialState),
      });
    }
  }, [user, isAuthenticated, initialState]);

  return {
    user,
    ability,
    isAuthenticated,
  };
}
