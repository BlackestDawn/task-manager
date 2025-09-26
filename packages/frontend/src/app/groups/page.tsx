import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchGroupData } from "@/lib/auth/prefetching";
import ProtectedRoute from "@/components/auth/protectedRoute";
import CreateGroupSection from "@/components/groups/createGroupSection";
import GroupsList from "@/components/groups/groupsList";
import type { Metadata } from "next";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: "Task Managers - Groups",
  description: "Manage groups and team collaboration",
}

export default async function GroupsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
      },
    },
  });

  await prefetchGroupData(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedRoute action="read" subject="Group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Groups</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage teams and collaborate on tasks
              </p>
            </div>
            <CreateGroupSection />
          </div>
          <GroupsList />
        </div>
      </ProtectedRoute>
    </HydrationBoundary>
  );
}