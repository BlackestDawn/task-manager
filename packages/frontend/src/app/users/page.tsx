import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchUserData } from "@/lib/api/auth/serverPrefetching";
import ProtectedRoute from "@/components/auth/protectedRoute";
import UsersList from "@/components/users/usersList";
import CreateUserSection from "@/components/users/createUserSection";
import type { Metadata } from "next";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: "Task Manager - users",
  description: "Manage users and their permissions",
};

export default async function UsersPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
      },
    },
  });

  await prefetchUserData(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedRoute action="read" subject="User">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage users and their permissions
              </p>
            </div>
            <CreateUserSection />
          </div>
          <UsersList />
        </div>
      </ProtectedRoute>
    </HydrationBoundary>
  );
}
