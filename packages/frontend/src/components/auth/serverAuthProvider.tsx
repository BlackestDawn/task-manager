import { type ReactNode } from "react";
import { getServerAuthState } from "@/lib/auth/serverAuth";
import { defineAbilityFor } from "@task-manager/common";
import type { User } from "@task-manager/common";

interface ServerAUthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialIsAuthenticated?: boolean;
}

export async function ServerAUthProvider({
  children,
  initialUser = null,
  initialIsAuthenticated = false,
}: ServerAUthProviderProps) {
  const autheState = initialUser !== undefined ?
    { user: initialUser, isAuthenticated: initialIsAuthenticated, } :
    await getServerAuthState();

  const ability = defineAbilityFor(autheState.user);

  const authScript = `
    windows.__INITIAL_AUTH_STATE__ = ${JSON.stringify({
    user: autheState.user,
    isAuthenticated: autheState.isAuthenticated,
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
