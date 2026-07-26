import { type ReactNode } from "react";
import { checkAuthAction } from "@/lib/actions/auth";
import type { User } from "@task-manager/common";

interface ServerAuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialIsAuthenticated?: boolean;
}

export async function ServerAuthProvider({
  children,
  initialUser,
  initialIsAuthenticated = false,
}: ServerAuthProviderProps) {
  const authState = initialUser !== undefined
    ? { user: initialUser, isAuthenticated: initialIsAuthenticated, }
    : await checkAuthAction();

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
