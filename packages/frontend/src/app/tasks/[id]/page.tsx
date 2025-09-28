import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchTaskDetails } from "@/lib/auth/prefetching";
import TaskDetailsClient from "@/components/tasks/taskDetailsClient";
import ProtectedRoute from "@/components/auth/protectedRoute";
import type { Metadata } from "next";
import type { IDParamProp } from "@/lib/data/interfaces/general";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: 'Task Manager - Task Details',
  description: 'Viewing details of a specific task.',
};

export default async function TaskDetailsPage({ params }: IDParamProp) {
  const { id } = await params;

  if (!id) {
    return <div>Invalid task ID</div>;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
      },
    },
  });

  // Prefetch the specific task details
  await prefetchTaskDetails(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedRoute>
        <TaskDetailsClient taskId={id} />
      </ProtectedRoute>
    </HydrationBoundary>
  );
}
