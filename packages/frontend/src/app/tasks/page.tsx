import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchTaskData } from "@/lib/auth/prefetching";
import TasksClient from "@/components/tasks/tasksClient";
import ProtectedRoute from "@/components/auth/protectedRoute";
import type { Metadata } from "next";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: 'Task Manager - Tasks',
  description: 'Displaying and manage tasks.',
};

export default async function TasksPage() {
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
        <TasksClient />
      </ProtectedRoute>
    </HydrationBoundary>
  );
}
