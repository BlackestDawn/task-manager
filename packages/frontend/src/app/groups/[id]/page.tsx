'use client';
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/protectedRoute";
import GroupDetailsPage from "@/components/groups/groupDetailsPage";

export default function GroupPage() {
  const { id } = useParams()

  if (!id) return <div>Invalid group ID</div>;

  return (
    <ProtectedRoute action="read" subject="Group">
      <GroupDetailsPage groupId={id as string} />
    </ProtectedRoute>
  )
}
