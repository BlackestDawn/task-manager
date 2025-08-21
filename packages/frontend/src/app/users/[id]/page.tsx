import UserDetailsPage from "@/components/users/userDetails";
import type { IDParamProp } from "@/lib/data/interfaces/general";
import type { UserProp } from "@/lib/data/interfaces/user";
import { fetchUserById } from "@/lib/api/user";
import { Suspense } from "react";
import ProtectedRoute from "@/components/auth/protectedRoute";

export async function generateMetadata({ params }: IDParamProp) {
  const user = await fetchUserById(params.id);

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'The requested user does not exist.',
    };
  }

  return {
    title: `Task Manager - User ${user.name}`,
    description: `Details for user ${user.name}`,
  };
}

export default async function UserDetailsPageWrapper({ params }: IDParamProp) {
  const { id } = await params;
  const user = await fetchUserById(id);

  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <UserPage user={user} />
      </Suspense>
    </ProtectedRoute>
  );
}

function UserPage({ user }: UserProp) {
  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div>
      <h2>User Details:</h2>
      <UserDetailsPage user={user} />
    </div>
  );
}