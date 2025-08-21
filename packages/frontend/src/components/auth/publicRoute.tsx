"use client";
import type { ReactNode } from "react";
import { useAuthContext } from "./authProvider";

interface PublicRouteProps {
  children: ReactNode;
  showWhenAuthenticated?: boolean;
}

export default function PublicRoute({
  children,
  showWhenAuthenticated = true
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated && !showWhenAuthenticated) return null;

  return <>{children}</>;
}