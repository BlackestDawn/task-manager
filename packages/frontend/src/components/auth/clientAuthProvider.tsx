'use client';
import { createContext, useContext, type ReactNode } from "react";
import type { User, AppAbility } from "@task-manager/common";
import { defineAbilityFor } from "@task-manager/common";

interface AuthContextType {
  user: User | null;
  ability: AppAbility;
  isAuthenticated: boolean;
}

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
  const user = typeof window !== "undefined" ? window.__INITIAL_AUTH_STATE__?.user || null : null;
  const isAuthenticated = typeof window !== "undefined" ? window.__INITIAL_AUTH_STATE__?.isAuthenticated || false : false;
  const ability = defineAbilityFor(user);

  return (
    <AuthContext.Provider value={{ user, ability, isAuthenticated }}>
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
