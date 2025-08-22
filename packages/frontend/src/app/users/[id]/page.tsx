'use client';
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protectedRoute";
import UserDetailsPage from "@/components/users/userDetailsPage";

export default function UserPage() {
  const params = useParams();
  const userId = params.id as string;

  if (!userId) return <div>Invalid user ID</div>;

  return (
    <ProtectedRoute action="read" subject="User">
      <UserDetailsPage userId={userId} />
    </ProtectedRoute>
  )
}