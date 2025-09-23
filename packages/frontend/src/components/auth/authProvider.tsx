'use client';
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User, AppAbility } from "@task-manager/common";

interface AuthContextType {
  user: User | null | undefined;
  ability: AppAbility;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderPops {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderPops) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
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
