'use client';
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protectedRoute";
import UserDetailsPage from "@/components/users/userDetailsPage";

export default function UserPage() {
  const { id } = useParams();

  if (!id) return <div>Invalid user ID</div>;

  return (
    <ProtectedRoute action="read" subject="User">
      <UserDetailsPage userId={id as string} />
    </ProtectedRoute>
  )
}
