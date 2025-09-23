'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User, AppAbility } from "@task-manager/common";
import type { AuthState } from "@/lib/data/interfaces/auth";

interface AuthContextType {
  user: User | null | undefined;
  ability: AppAbility;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    __INITIAL_AUTH_STATE__?: AuthState;
  }
}

interface ClientAuthProviderPops {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderPops) {
  const [initialAuthState, setInitialAuthState] = useState<AuthState | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_AUTH_STATE__) {
      setInitialAuthState(window.__INITIAL_AUTH_STATE__);
      delete window.__INITIAL_AUTH_STATE__;
    }
  }, []);

  const auth = useAuth(initialAuthState);

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
