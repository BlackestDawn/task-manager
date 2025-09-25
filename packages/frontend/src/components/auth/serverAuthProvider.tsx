import { type ReactNode } from "react";
import { getServerAuthState } from "@/lib/auth/serverAuth";
import { defineAbilityFor } from "@task-manager/common";
import type { User } from "@task-manager/common";

interface ServerAuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialIsAuthenticated?: boolean;
}

export async function ServerAuthProvider({
  children,
  initialUser = null,
  initialIsAuthenticated = false,
}: ServerAuthProviderProps) {
  const authState = initialUser !== undefined ?
    { user: initialUser, isAuthenticated: initialIsAuthenticated, } :
    await getServerAuthState();

  const ability = defineAbilityFor(authState.user);

  const authScript = `
    window.__INITIAL_AUTH_STATE__ = ${JSON.stringify({
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
  })};
  `;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: authScript }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
