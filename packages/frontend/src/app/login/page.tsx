import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAuthAction } from "@/lib/actions/auth";
import LoginForm from "@/components/auth/loginForm";

export const metadata: Metadata = {
  title: 'Task Manager - Login',
  description: 'Login to your account.',
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { isAuthenticated } = await checkAuthAction();
  const { redirect: redirectTo } = await searchParams;

  if (isAuthenticated) redirect(redirectTo || "/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
