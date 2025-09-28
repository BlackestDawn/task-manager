"use client";
import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./clientAuthProvider";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface PublicRouteProps {
  children: ReactNode;
  showWhenAuthenticated?: boolean;
  redirectTo?: string;
}

export default function PublicRoute({
  children,
  showWhenAuthenticated = true,
  redirectTo,
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && redirectTo) router.push(redirectTo);
  }, [isLoading, isAuthenticated, router, redirectTo]);

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated && !showWhenAuthenticated) return null;

  return <>{children}</>;
}
