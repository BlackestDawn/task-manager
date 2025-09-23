'use client';
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./authProvider";
import type { Actions, Subjects } from "@task-manager/common";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  action?: Actions;
  subject?: Subjects;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  action,
  subject,
  redirectTo = "/login",
}: ProtectedRouteProps ) {
  const { isAuthenticated, isLoading, ability } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `${redirectTo}?redirected=true&from=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [isLoading, requireAuth, isAuthenticated, router, redirectTo]);

  if (isLoading) return <LoadingSpinner />;

  if (requireAuth && !isAuthenticated) return null;

  if (action && subject && !ability.can(action, subject)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">
              You don&apos;t have permission to access this resource.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
