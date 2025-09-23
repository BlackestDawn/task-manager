"use client";
import type { ReactNode } from "react";
import { useAuthContext } from "./clientAuthProvider";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface PublicRouteProps {
  children: ReactNode;
  showWhenAuthenticated?: boolean;
}

export default function PublicRoute({
  children,
  showWhenAuthenticated = true
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated && !showWhenAuthenticated) return null;

  return <>{children}</>;
}