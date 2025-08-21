'use client';
import { useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/lib/auth/queries";
import { validateLoginRequest } from "@task-manager/common";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import RedirectNotification from "./RedirectNotification";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();

  const form = useForm({
    defaultValues: {
      login: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = validateLoginRequest(value);
        await loginMutation.mutateAsync(validatedData);

        const redirectedFrom = searchParams.get("from");
        if (redirectedFrom) {
          router.push(decodeURIComponent(redirectedFrom));
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
  });

  return (
    <>
      <RedirectNotification />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <form.Field name="login">
                {(field) => (
                  <div>
                    <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                      Login
                    </label>
                    <input
                      id="login"
                      name="login"
                      type="text"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your login"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {loginMutation.error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  Login failed. Please check your credentials and try again.
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                </span>
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
