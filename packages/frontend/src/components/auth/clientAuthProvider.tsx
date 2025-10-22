'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@task-manager/common";
import { defineAbilityFor } from "@task-manager/common";
import type { AuthContextType } from "@/lib/data/interfaces/auth";
import { checkAuthAction } from "@/lib/actions/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    __INITIAL_AUTH_STATE__?: {
      user: User | null;
      isAuthenticated: boolean;
    };
  }
}

interface ClientAuthProviderPops {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderPops) {
  const [authState, setAuthState] = useState<{
    user: User | null;
    isAuthenticated: boolean;
  }>(() => {
    if (typeof window !== "undefined" && window.__INITIAL_AUTH_STATE__) return window.__INITIAL_AUTH_STATE__;
    return { user: null, isAuthenticated: false };
  });

  const ability = defineAbilityFor(authState.user);

  const refreshAuth = async () => {
    try {
      const result = await checkAuthAction();
      setAuthState({ user: result.user, isAuthenticated: result.isAuthenticated });
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      setAuthState({ user: null, isAuthenticated: false });
    }
  };

  useEffect(() => {
    if (!authState.user && typeof window !== "undefined") refreshAuth();

    const interval = setInterval(() => {
      refreshAuth();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [authState]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_changed") refreshAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleTokenRefresh = () => refreshAuth();

    window.addEventListener("token_refreshed", handleTokenRefresh);
    return () => window.removeEventListener("token_refreshed", handleTokenRefresh);
  }, []);

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      ability,
      isAuthenticated: authState.isAuthenticated,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
