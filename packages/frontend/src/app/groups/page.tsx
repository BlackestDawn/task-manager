import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchGroups } from "@/lib/api/group";
import type { GroupArrayProp } from "@/lib/data/interfaces/group";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protectedRoute";

export const metadata: Metadata = {
  title: 'Task Manager - Groups',
  description: 'Display and manage user groups',
};

export default async function GroupsPageWrapper() {
  const groups = await fetchGroups();
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <GroupsPage groups={groups} />
      </Suspense>
    </ProtectedRoute>
  );
}

function GroupsPage({ groups }: GroupArrayProp) {
  return (
    <div>
      <h2>Available groups:</h2>
      <ul>
        {groups.map(group => (
          <li key={group.id}>
            <Link href={`/groups/${group.id}`}>{group.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
