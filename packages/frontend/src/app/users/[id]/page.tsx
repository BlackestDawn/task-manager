import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { prefetchUserDetails } from "@/lib/api/auth/serverPrefetching";
import UserDetailsPage from "@/components/users/userDetailsPage";
import ProtectedRoute from "@/components/auth/protectedRoute";
import type { Metadata } from "next";
import type { IDParamProp } from "@/lib/data/interfaces/general";
import { FIVE_MINUTES } from "@/lib/data/consts";

export const metadata: Metadata = {
  title: "Task Managers - User Details",
  description: "View and edit user details",
}

export default async function UserPage({ params }: IDParamProp) {
  const { id } = await params;

  if (!id) {
    return <div>Invalid user ID</div>;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
      },
    },
  });

  await prefetchUserDetails(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedRoute>
        <UserDetailsPage userId={id} />
      </ProtectedRoute>
    </HydrationBoundary>
  );
}
