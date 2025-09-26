import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchGroupDetails } from "@/lib/auth/prefetching";
import GroupDetailsPage from "@/components/groups/groupDetailsPage";
import ProtectedRoute from "@/components/auth/protectedRoute";
import type { Metadata } from "next";
import type { IDParamProp } from "@/lib/data/interfaces/general";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: "Task Manager - Group details",
  description: "View and manage a groups details",
}

export default async function GroupPage({ params }: IDParamProp) {
  const { id } = await params;

  if (!id) {
    return <div>Invalid group ID</div>;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
      },
    },
  });

  await prefetchGroupDetails(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedRoute>
        <GroupDetailsPage groupId={id} />
      </ProtectedRoute>
    </HydrationBoundary>
  );
}
