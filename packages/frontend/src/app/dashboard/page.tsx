import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchTaskData } from "@/lib/auth/prefetching";
import DashboardClient from "@/components/dashboard/dashboardClient";
import ProtectedRoute from "@/components/auth/protectedRoute";
import type { Metadata } from "next";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: 'Task Manager - Dashboard',
  description: 'Dashboard overview of tasks and activities.',
};

export default async function DashboardPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
      },
    },
  });

  await prefetchTaskData(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedRoute>
        <DashboardClient />
      </ProtectedRoute>
    </HydrationBoundary>
  );
}
